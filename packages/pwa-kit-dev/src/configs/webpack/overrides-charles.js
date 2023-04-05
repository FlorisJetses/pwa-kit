const path = require('path')
const fs = require('fs')

/**
 * Implements a b2c-cartridge-like overlay resolve for webpack
 *
 * @example
 * // import from the *next* in the overlay-chain (i.e. similar to module.superModule)
 * import Something from '*'
 *
 * @example
 * // import from the overlay chain (not the forward slash is escaped here due to being in a comment)
 * import Something, {SomethingElse} from '*\/components/something'
 *
 * @example
 * // (ONLY IN BASE) paths required relative to the appBase will first be searched through the overlays
 * import Something from '../../components/something'
 *
 * @class OverlayResolverPlugin
 */
class OverlayResolverPlugin {
    /**
     *
     * @param options
     * @param {string} options.appBase path to application base
     * @param {string[]} options.overlays paths to overlays
     */
    constructor(options) {
        this.appBase = options.appBase || './app'
        this.appBase = path.resolve(this.appBase)
        this.overlays = options.overlays || []
        this._allSearchDirs = this.overlays
            .map((o) => path.join(path.resolve(o), path.basename(this.appBase)))
            .concat([this.appBase])
    }

    isRelevant(p) {
        return [this.appBase].concat(this.overlays).some((_configPath) => {
            _configPath.indexOf(p)
        })
    }

    isBaseFile(p) {
        return p.indexOf(this.appBase) === 0
    }

    /**
     *
     * @param requestPath
     * @param target
     * @param {[]} extensions
     */
    findFile(requestPath, dirs, extensions) {
        // TODO search all overlay extensions of requested file
        var fileExt = path.extname(requestPath)
        for (var dir of dirs) {
            var base = path.join(dir, requestPath)
            if (fileExt) {
                if (fs.existsSync(base)) {
                    return base
                }
            } else {
                // TODO this is technically not how we should find index
                // see resolver plugin docs
                if (fs.existsSync(base) && fs.lstatSync(base).isDirectory()) {
                    base = path.join(base, 'index')
                }
                for (var ext of extensions) {
                    if (fs.existsSync(base + ext)) {
                        return base + ext
                    }
                }
            }
        }
    }

    /**
     *
     */
    toOverlayRelative(p) {
        var overlay = this.findOverlay(p)
        return p.substring(overlay.length + 1)
    }

    findOverlay(p) {
        return this._allSearchDirs.find((overlay) => {
            return p.indexOf(overlay) === 0
        })
    }

    isAppBaseRelative(p) {
        return p && p.indexOf(this.appBase) === 0
    }

    apply(resolver) {
        resolver.getHook('resolve').tapAsync(
            'FeatureResolverPlugin',
            function (requestContext, resolveContext, callback) {
                // exact match * means import the "parent" (superModule) of the requesting module
                if (requestContext.request === '*') {
                    // const targetFile = this.findFile(requestContext.path, requestContext.)
                    const overlayRelative = this.toOverlayRelative(requestContext.context.issuer)
                    const overlay = this.findOverlay(requestContext.context.issuer)
                    const searchOverlays = this._allSearchDirs.slice(
                        this._allSearchDirs.indexOf(overlay) + 1
                    )
                    var targetFile = this.findFile(
                        overlayRelative,
                        searchOverlays,
                        resolver.options.extensions
                    )
                    if (!targetFile) {
                        targetFile = path.resolve(__dirname, 'null.js')
                    }
                    const target = resolver.ensureHook('resolved')
                    requestContext.path = targetFile
                    resolver.doResolve(
                        target,
                        requestContext,
                        `${this.constructor.name} found parent`,
                        resolveContext,
                        callback
                    )
                } else if (requestContext.request.startsWith('*/')) {
                    // let aliases find the file
                    return callback()
                } else if (
                    this.isAppBaseRelative(requestContext.path) &&
                    requestContext.request.startsWith('.')
                ) {
                    // app base request relative
                    var resolvedPath = path.resolve(requestContext.path, requestContext.request)
                    if (this.isAppBaseRelative(resolvedPath)) {
                        let overlayRelative = this.toOverlayRelative(resolvedPath)
                        let targetFile, target
                        try {
                            targetFile = this.findFile(
                                overlayRelative,
                                this._allSearchDirs,
                                resolver.options.extensions
                            )
                            if (targetFile) {
                                target = resolver.ensureHook('resolved')
                                requestContext.path = targetFile
                                resolver.doResolve(
                                    target,
                                    requestContext,
                                    `${this.constructor.name} found base override file`,
                                    resolveContext,
                                    callback
                                )
                            } else {
                                return callback()
                            }
                        } catch (e) {
                            return callback()
                        }
                    } else {
                        return callback()
                    }
                } else if (
                    requestContext.request &&
                    this.isAppBaseRelative(requestContext.request)
                ) {
                    // external dependency requiring app code (app-config, app, ssr, etc)
                    // TODO: DRY this is nearly the same as the above condition
                    let overlayRelative = this.toOverlayRelative(requestContext.request)
                    let targetFile, target
                    try {
                        targetFile = this.findFile(
                            overlayRelative,
                            this._allSearchDirs,
                            resolver.options.extensions
                        )
                        if (targetFile) {
                            target = resolver.ensureHook('resolved')
                            requestContext.path = targetFile
                            resolver.doResolve(
                                target,
                                requestContext,
                                `${this.constructor.name} found base override file`,
                                resolveContext,
                                callback
                            )
                        } else {
                            return callback()
                        }
                    } catch (e) {
                        return callback()
                    }
                } else {
                    callback()
                }
            }.bind(this)
        )
    }
}

module.exports = OverlayResolverPlugin