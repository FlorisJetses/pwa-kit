/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import React from 'react'
import {render, screen} from '@testing-library/react'
import Error from './index'

describe('Error Page', () => {
    const stack = 'Error Stack'
    const status = 500
    const message = 'Error message'

    test('Renders correctly', () => {
        render(<Error message={message} stack={stack} status={status} />)
        expect(screen.getByText(message)).toBeInTheDocument()
        expect(screen.getByText(stack)).toBeInTheDocument()
        expect(screen.getByText(`Error Status: ${status}`)).toBeInTheDocument()
    })

    // TODO: check if there's an equivalent in react test lib to check for number or potentially remove test
    test('Ensure that status type is a number', () => {
        const wrapper = mount(<Error message={message} status={status} />)
        expect(typeof wrapper.props().status).toBe('number')
    })
})
