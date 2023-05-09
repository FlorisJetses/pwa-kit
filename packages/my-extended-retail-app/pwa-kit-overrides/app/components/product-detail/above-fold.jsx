/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import React from 'react'
import {Box, SimpleGrid, Icon, Text, Stack, Flex} from '@chakra-ui/react'
import {HeartIcon, SocialTwitterIcon, CheckIcon} from 'retail-react-app/app/components/icons'
import PropTypes from 'prop-types'

const Feature = ({title, text, icon}) => {
    return (
        <Stack>
            <Flex
                w={16}
                h={16}
                align={'center'}
                justify={'center'}
                color={'white'}
                rounded={'full'}
                bg={'gray.100'}
                mb={1}
            >
                {icon}
            </Flex>
            <Text fontWeight={600}>{title}</Text>
            <Text color={'gray.600'}>{text}</Text>
        </Stack>
    )
}

const AbovePDP = () => {
    return (
        <Box p={4}>
            <SimpleGrid columns={{base: 1, md: 3}} spacing={10}>
                <Feature
                    icon={<Icon as={HeartIcon} w={10} h={10} />}
                    title={'Hello there'}
                    text={
                        'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore...'
                    }
                />
                <Feature
                    icon={<Icon as={SocialTwitterIcon} w={10} h={10} />}
                    title={'This is'}
                    text={
                        'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore...'
                    }
                />
                <Feature
                    icon={<Icon as={CheckIcon} w={10} h={10} />}
                    title={'A component slot'}
                    text={
                        'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore...'
                    }
                />
            </SimpleGrid>
        </Box>
    )
}

AbovePDP.displayName = 'AbovePDP'

Feature.propTypes = {
    title: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired
}

export default AbovePDP
