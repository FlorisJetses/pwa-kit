/*
 * Copyright (c) 2023, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import {MutationFunction, useMutation, UseMutationResult} from '@tanstack/react-query'
import useAuth from '../useAuth'
import Auth from '../../auth'

export const ShopperLoginHelpers = {
    LoginGuestUser: 'loginGuestUser',
    LoginRegisteredUserB2C: 'loginRegisteredUserB2C',
    Register: 'register',
    Logout: 'logout'
} as const

export type ShopperLoginHelper = (typeof ShopperLoginHelpers)[keyof typeof ShopperLoginHelpers]

/**
 * A hook for Public Client Shopper Login OAuth helpers.
 * The hook calls the SLAS helpers imported from commerce-sdk-isomorphic.
 * For more, see https://github.com/SalesforceCommerceCloud/commerce-sdk-isomorphic/#public-client-shopper-login-helpers
 *
 * Avaliable helpers:
 * - loginRegisteredUserB2C
 * - loginGuestUser
 * - register
 * - logout
 */
export function useShopperLoginHelper<Mutation extends ShopperLoginHelper>(
    mutation: Mutation
): UseMutationResult<
    // Extract the data from the returned promise (all mutations should be async)
    ReturnType<Auth[Mutation]> extends Promise<infer Data> ? Data : never,
    unknown,
    // Variables = void if no arguments, otherwise the first argument
    [] extends Parameters<Auth[Mutation]> ? void : Parameters<Auth[Mutation]>[0],
    unknown
> {
    const auth = useAuth()
    if (!auth[mutation]) throw new Error(`Unknown login helper mutation: ${mutation}`)

    // I'm not sure if there's a way to avoid this type assertion, but, I'm fairly confident that
    // it is safe to do, as it seems to be simply re-asserting what we already know.
    type Method = Auth[Mutation]
    type PromisedData = ReturnType<Method>
    type Data = PromisedData extends Promise<infer D> ? D : never
    type Variables = [] extends Parameters<Method> ? void : Parameters<Method>[0]
    const method = auth[mutation].bind(auth) as MutationFunction<Data, Variables>
    return useMutation(auth.whenReady(method))
}
