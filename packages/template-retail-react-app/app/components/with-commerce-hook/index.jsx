/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import React, {Fragment} from 'react'

/**
 * Higher-order component used to conditionally render a provided placeholder component, while data is fetched using
 * the provided hook
 *
 * @param {Component} Component - the component you want to be conditionally rendered and provided data to.
 * @param {Object} opts.hook - a commercerce react sdk hook used to fetch data with.
 * @param {Object} opts.queryOption - query parameters passed to the hook, optionally can be a function that returns
 * a query parameter object.
 * @param {Object} opts.placeholderContent - the component you want be rendered while data is being fetched
 * @returns {Component} - the enhanced component.
 */
const withCommerceData = (Component, opts = {}) => {
    const WrappedComponent = (props) => {
        const {hook, queryOption, placeholderContent} = opts
        const {data, isLoading} = hook(
            typeof queryOption === 'function' ? queryOption(props) : queryOption
        )

        return isLoading ? (
            <Fragment>{placeholderContent}</Fragment>
        ) : (
            <Component {...props} data={data} />
        )
    }

    WrappedComponent.propTypes = {}

    return WrappedComponent
}

export default withCommerceData