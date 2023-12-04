/*
 * Copyright (c) 2023, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import React, {useState} from 'react'
import {useIntl} from 'react-intl'
import {useCustomerId, useShopperCustomersMutation} from '@salesforce/commerce-sdk-react'

// Components
import {
    Box,
    Flex,
    SimpleGrid,
    Grid,
    Select,
    Stack,
    Button
} from '@salesforce/retail-react-app/app/components/shared/ui'

// Project Components
import Pagination from '@salesforce/retail-react-app/app/components/pagination'
import ProductTile, {
    Skeleton as ProductTileSkeleton
} from '@salesforce/retail-react-app/app/components/product-tile'
import Refinements from '@salesforce/retail-react-app/app/pages/product-list/partials/refinements'

// Icons

// Hooks
import {useLimitUrls, usePageUrls} from '@salesforce/retail-react-app/app/hooks'
import {useToast} from '@salesforce/retail-react-app/app/hooks/use-toast'
import useEinstein from '@salesforce/retail-react-app/app/hooks/use-einstein'

// Others

// Constants
import {
    DEFAULT_LIMIT_VALUES,
    API_ERROR_MESSAGE,
    TOAST_ACTION_VIEW_WISHLIST,
    TOAST_MESSAGE_ADDED_TO_WISHLIST,
    TOAST_MESSAGE_REMOVED_FROM_WISHLIST
} from '@salesforce/retail-react-app/app/constants'
import useNavigation from '@salesforce/retail-react-app/app/hooks/use-navigation'
import {useWishList} from '@salesforce/retail-react-app/app/hooks/use-wish-list'
import {isHydrated} from '@salesforce/retail-react-app/app/utils/utils'

/* eslint-disable react/prop-types */
const ProductListBody = (props) => {
    const {
        filtersLoading,
        toggleFilter,
        productSearchResult,
        searchParams,
        isRefetching,
        searchQuery,
        category,
        basePath
    } = props

    const {formatMessage} = useIntl()
    const navigate = useNavigation()
    const toast = useToast()
    const einstein = useEinstein()
    const customerId = useCustomerId()

    // Get urls to be used for pagination, page size changes, and sorting.
    const pageUrls = usePageUrls({total: productSearchResult?.total})
    const limitUrls = useLimitUrls()

    /**************** Wishlist Management ****************/
    const [wishlistLoading, setWishlistLoading] = useState([])
    const {data: wishlist} = useWishList()
    const {mutateAsync: createCustomerProductListItem} = useShopperCustomersMutation(
        'createCustomerProductListItem'
    )
    const {mutateAsync: deleteCustomerProductListItem} = useShopperCustomersMutation(
        'deleteCustomerProductListItem'
    )
    const addItemToWishlist = async (product) => {
        setWishlistLoading([...wishlistLoading, product.productId])

        // TODO: This wishlist object is from an old API, we need to replace it with the new one.
        const listId = wishlist.id
        await createCustomerProductListItem(
            {
                parameters: {customerId, listId},
                body: {
                    quantity: 1,
                    public: false,
                    priority: 1,
                    type: 'product',
                    productId: product.productId
                }
            },
            {
                onError: () => {
                    toast({
                        title: formatMessage(API_ERROR_MESSAGE),
                        status: 'error'
                    })
                },
                onSuccess: () => {
                    toast({
                        title: formatMessage(TOAST_MESSAGE_ADDED_TO_WISHLIST, {quantity: 1}),
                        status: 'success',
                        action: (
                            // it would be better if we could use <Button as={Link}>
                            // but unfortunately the Link component is not compatible
                            // with Chakra Toast, since the ToastManager is rendered via portal
                            // and the toast doesn't have access to intl provider, which is a
                            // requirement of the Link component.
                            <Button variant="link" onClick={() => navigate('/account/wishlist')}>
                                {formatMessage(TOAST_ACTION_VIEW_WISHLIST)}
                            </Button>
                        )
                    })
                },
                onSettled: () => {
                    setWishlistLoading(wishlistLoading.filter((id) => id !== product.productId))
                }
            }
        )
    }

    const removeItemFromWishlist = async (product) => {
        setWishlistLoading([...wishlistLoading, product.productId])

        const listId = wishlist.id
        const itemId = wishlist.customerProductListItems.find(
            (i) => i.productId === product.productId
        ).id

        await deleteCustomerProductListItem(
            {
                body: {},
                parameters: {customerId, listId, itemId}
            },
            {
                onError: () => {
                    toast({
                        title: formatMessage(API_ERROR_MESSAGE),
                        status: 'error'
                    })
                },
                onSuccess: () => {
                    toast({
                        title: formatMessage(TOAST_MESSAGE_REMOVED_FROM_WISHLIST),
                        status: 'success'
                    })
                },
                onSettled: () => {
                    setWishlistLoading(wishlistLoading.filter((id) => id !== product.productId))
                }
            }
        )
    }

    return (
        <Grid templateColumns={{base: '1fr', md: '280px 1fr'}} columnGap={6}>
            <Stack display={{base: 'none', md: 'flex'}}>
                <Refinements
                    isLoading={filtersLoading}
                    toggleFilter={toggleFilter}
                    filters={productSearchResult?.refinements}
                    selectedFilters={searchParams.refine}
                />
            </Stack>
            <Box>
                <SimpleGrid columns={[2, 2, 3, 3]} spacingX={4} spacingY={{base: 12, lg: 16}}>
                    {isHydrated() && (isRefetching || !productSearchResult)
                        ? new Array(searchParams.limit)
                              .fill(0)
                              .map((value, index) => <ProductTileSkeleton key={index} />)
                        : productSearchResult?.hits?.map((productSearchItem) => {
                              const productId = productSearchItem.productId
                              const isInWishlist = !!wishlist?.customerProductListItems?.find(
                                  (item) => item.productId === productId
                              )

                              return (
                                  <ProductTile
                                      data-testid={`sf-product-tile-${productSearchItem.productId}`}
                                      key={productSearchItem.productId}
                                      product={productSearchItem}
                                      enableFavourite={true}
                                      isFavourite={isInWishlist}
                                      onClick={() => {
                                          if (searchQuery) {
                                              einstein.sendClickSearch(
                                                  searchQuery,
                                                  productSearchItem
                                              )
                                          } else if (category) {
                                              einstein.sendClickCategory(
                                                  category,
                                                  productSearchItem
                                              )
                                          }
                                      }}
                                      onFavouriteToggle={(isFavourite) => {
                                          const action = isFavourite
                                              ? addItemToWishlist
                                              : removeItemFromWishlist
                                          return action(productSearchItem)
                                      }}
                                      dynamicImageProps={{
                                          widths: ['50vw', '50vw', '20vw', '20vw', '25vw']
                                      }}
                                  />
                              )
                          })}
                </SimpleGrid>
                {/* Footer */}
                <Flex justifyContent={['center', 'center', 'flex-start']} paddingTop={8}>
                    <Pagination currentURL={basePath} urls={pageUrls} />

                    {/*
              Our design doesn't call for a page size select. Show this element if you want
              to add one to your design.
          */}
                    <Select
                        display="none"
                        value={basePath}
                        onChange={({target}) => {
                            history.push(target.value)
                        }}
                    >
                        {limitUrls.map((href, index) => (
                            <option key={href} value={href}>
                                {DEFAULT_LIMIT_VALUES[index]}
                            </option>
                        ))}
                    </Select>
                </Flex>
            </Box>
        </Grid>
    )
}

ProductListBody.propTypes = {}

export default ProductListBody
