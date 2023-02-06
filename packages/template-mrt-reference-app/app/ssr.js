/*
 * Copyright (c) 2022, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
const path = require('path')
const {getRuntime} = require('pwa-kit-runtime/ssr/server/express')
const pkg = require('../package.json')
const basicAuth = require('express-basic-auth')
const fetch = require('cross-fetch')

/**
 * Custom error class
 */
class IntentionalError extends Error {
    constructor(diagnostics, ...params) {
        super(...params)
        this.message = JSON.stringify(diagnostics, null, 2)
        this.name = 'IntentionalError'
    }
}

const ENVS_TO_EXPOSE = [
    'aws_execution_env',
    'aws_lambda_function_memory_size',
    'aws_lambda_function_name',
    'aws_lambda_function_version',
    'aws_lambda_log_group_name',
    'aws_lambda_log_stream_name',
    'aws_region',
    'bundle_id',
    'deploy_id',
    'deploy_target',
    'external_domain_name',
    'mobify_property_id',
    'node_env',
    'tz'
]

const HEADERS_TO_REDACT = ['x-api-key', 'x-apigateway-context', 'x-apigateway-event']

const BADSSL_TLS1_1_URL = 'https://tls-v1-1.badssl.com:1011/'
const BADSSL_TLS1_2_URL = 'https://tls-v1-2.badssl.com:1012/'

const redactAndSortObjectKeys = (o, redactList = HEADERS_TO_REDACT) => {
    const redact = (k) => ({[k]: redactList.includes(k) ? '*****' : o[k]})
    return Object.assign({}, ...Object.keys(o).sort().map(redact))
}

/**
 * Shallow-clone the given object such that the only keys on the
 * clone are those in the given whitelist, and so that the keys are
 * in alphanumeric sort order.
 * @param o the object to clone
 * @param whitelist an Array of strings for keys that should be included.
 * If a string ends in a '*', the key may contain zero or more characters
 * matched by the '*' (i.e., it must start with the whitelist string up to
 * but not including the '*')
 * @return {{}}
 */
const filterAndSortObjectKeys = (o, whitelist) =>
    o &&
    Object.keys(o)
        // Include only whitelisted keys
        .filter((key) => {
            const keylc = key.toLowerCase().trim()
            return whitelist.some(
                (pattern) =>
                    // wildcard matching
                    (pattern.endsWith('*') && keylc.startsWith(pattern.slice(0, -1))) ||
                    pattern === keylc // equality matching
            )
        })
        // Sort the remaining keys
        .sort()
        // Include values
        .reduce((acc, key) => {
            acc[key] = o[key]
            return acc
        }, {})

/**
 * Return a JSON-serializable object with key diagnostic values from a request
 */
const jsonFromRequest = (req) => {
    return {
        protocol: req.protocol,
        method: req.method,
        path: req.path,
        query: req.query,
        route_path: req.route.path,
        body: req.body,
        headers: redactAndSortObjectKeys(req.headers),
        ip: req.ip,
        env: filterAndSortObjectKeys(process.env, ENVS_TO_EXPOSE)
    }
}

/**
 * Express handler that returns a JSON response with diagnostic values
 */
const echo = (req, res) => res.json(jsonFromRequest(req))

/**
 * Express handler that throws an IntentionalError
 */
const exception = (req) => {
    // Intentionally throw an exception so that we can check for it
    // in logs.
    throw new IntentionalError(jsonFromRequest(req))
}

/**
 * Express handler that makes 2 requests to badssl TLS testing domains
 * to verify that our applications can only make requests to domains with
 * updated TLS versions.
 */
const tlsVersionTest = async (_, res) => {
    let response11 = await fetch(BADSSL_TLS1_1_URL)
        .then((res) => res.ok)
        .catch(() => false)
    let response12 = await fetch(BADSSL_TLS1_2_URL)
        .then((res) => res.ok)
        .catch(() => false)
    res.header('Content-Type', 'application/json')
    res.send(JSON.stringify({'tls1.1': response11, 'tls1.2': response12}, null, 4))
}

/**
 * Logging middleware; logs request and response headers (and response status).
 */
const loggingMiddleware = (req, res, next) => {
    // Log request headers
    console.log(`Request: ${req.method} ${req.originalUrl}`)
    console.log(`Request headers: ${JSON.stringify(req.headers, null, 2)}`)
    // Arrange to log response status and headers
    res.on('finish', () => {
        const statusCode = res._header ? String(res.statusCode) : String(-1)
        console.log(`Response status: ${statusCode}`)
        if (res.headersSent) {
            const headers = JSON.stringify(res.getHeaders(), null, 2)
            console.log(`Response headers: ${headers}`)
        }
    })

    return next()
}

const options = {
    // The build directory (an absolute path)
    buildDir: path.resolve(process.cwd(), 'build'),

    // The cache time for SSR'd pages (defaults to 600 seconds)
    defaultCacheTimeSeconds: 600,

    // The port that the local dev server listens on
    port: 3000,

    // The protocol on which the development Express app listens.
    // Note that http://localhost is treated as a secure context for development.
    protocol: 'http',

    mobify: pkg.mobify
}

const runtime = getRuntime()

const {handler, app, server} = runtime.createHandler(options, (app) => {
    app.get('/favicon.ico', runtime.serveStaticFile('static/favicon.ico'))

    // Add middleware to explicitly suppress caching on all responses (done
    // before we invoke the handlers)
    app.use((req, res, next) => {
        res.set('Cache-Control', 'no-cache')
        return next()
    })

    // Add middleware to log request and response headers
    app.use(loggingMiddleware)

    // Configure routes
    app.all('/exception', exception)
    app.get('/tls', tlsVersionTest)

    // Add a /auth/logout path that will always send a 401 (to allow clearing
    // of browser credentials)
    app.all('/auth/logout', (req, res) => res.status(401).send('Logged out'))
    // Add auth middleware to the /auth paths only
    app.use(
        '/auth*',
        basicAuth({
            users: {mobify: 'supersecret'},
            challenge: true,
            // Use a realm that is different per target
            realm: process.env.EXTERNAL_DOMAIN_NAME || 'echo-test'
        })
    )
    app.all('/auth*', echo)
    // All other paths/routes invoke echo directly
    app.all('/*', echo)
    app.set('json spaces', 4)
})

// SSR requires that we export a single handler function called 'get', that
// supports AWS use of the server that we created above.
exports.get = handler
exports.server = server

exports.app = app
