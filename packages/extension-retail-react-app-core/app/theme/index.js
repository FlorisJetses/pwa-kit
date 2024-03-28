/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import {extendTheme} from '@salesforce/extension-retail-react-app-core/app/components/shared/ui'

// Foundational style overrides
import styles from '@salesforce/extension-retail-react-app-core/app/theme/foundations/styles'
import colors from '@salesforce/extension-retail-react-app-core/app/theme/foundations/colors'
import gradients from '@salesforce/extension-retail-react-app-core/app/theme/foundations/gradients'
import sizes from '@salesforce/extension-retail-react-app-core/app/theme/foundations/sizes'
import space from '@salesforce/extension-retail-react-app-core/app/theme/foundations/space'
import layerStyles from '@salesforce/extension-retail-react-app-core/app/theme/foundations/layerStyles'
import shadows from '@salesforce/extension-retail-react-app-core/app/theme/foundations/shadows'

// Base component style overrides
import Alert from '@salesforce/extension-retail-react-app-core/app/theme/components/base/alert'
import Accordion from '@salesforce/extension-retail-react-app-core/app/theme/components/base/accordion'
import Badge from '@salesforce/extension-retail-react-app-core/app/theme/components/base/badge'
import Button from '@salesforce/extension-retail-react-app-core/app/theme/components/base/button'
import Checkbox from '@salesforce/extension-retail-react-app-core/app/theme/components/base/checkbox'
import Container from '@salesforce/extension-retail-react-app-core/app/theme/components/base/container'
import Drawer from '@salesforce/extension-retail-react-app-core/app/theme/components/base/drawer'
import FormLabel from '@salesforce/extension-retail-react-app-core/app/theme/components/base/formLabel'
import Icon from '@salesforce/extension-retail-react-app-core/app/theme/components/base/icon'
import Input from '@salesforce/extension-retail-react-app-core/app/theme/components/base/input'
import Modal from '@salesforce/extension-retail-react-app-core/app/theme/components/base/modal'
import Radio from '@salesforce/extension-retail-react-app-core/app/theme/components/base/radio'
import Select from '@salesforce/extension-retail-react-app-core/app/theme/components/base/select'
import Skeleton from '@salesforce/extension-retail-react-app-core/app/theme/components/base/skeleton'
import Tooltip from '@salesforce/extension-retail-react-app-core/app/theme/components/base/tooltip'
import Popover from '@salesforce/extension-retail-react-app-core/app/theme/components/base/popover'

// Project Component style overrides
import App from '@salesforce/extension-retail-react-app-core/app/theme/components/project/_app'
import Breadcrumb from '@salesforce/extension-retail-react-app-core/app/theme/components/project/breadcrumb'
import Header from '@salesforce/extension-retail-react-app-core/app/theme/components/project/header'
import ListMenu from '@salesforce/extension-retail-react-app-core/app/theme/components/project/list-menu'
import Footer from '@salesforce/extension-retail-react-app-core/app/theme/components/project/footer'
import CheckoutFooter from '@salesforce/extension-retail-react-app-core/app/theme/components/project/checkout-footer'
import LinksList from '@salesforce/extension-retail-react-app-core/app/theme/components/project/links-list'
import DrawerMenu from '@salesforce/extension-retail-react-app-core/app/theme/components/project/drawer-menu'
import NestedAccordion from '@salesforce/extension-retail-react-app-core/app/theme/components/project/nested-accordion'
import LocaleSelector from '@salesforce/extension-retail-react-app-core/app/theme/components/project/locale-selector'
import OfflineBanner from '@salesforce/extension-retail-react-app-core/app/theme/components/project/offline-banner'
import Pagination from '@salesforce/extension-retail-react-app-core/app/theme/components/project/pagination'
import ProductTile from '@salesforce/extension-retail-react-app-core/app/theme/components/project/product-tile'
import SocialIcons from '@salesforce/extension-retail-react-app-core/app/theme/components/project/social-icons'
import SwatchGroup from '@salesforce/extension-retail-react-app-core/app/theme/components/project/swatch-group'
import ImageGallery from '@salesforce/extension-retail-react-app-core/app/theme/components/project/image-gallery'

// Please refer to the Chakra-Ui theme customization docs found
// here https://chakra-ui.com/docs/theming/customize-theme to learn
// more about extending and overriding themes for your project.
export const overrides = {
    styles,
    layerStyles,
    colors,
    sizes,
    space,
    gradients,
    shadows,
    components: {
        // base components
        Accordion,
        Alert,
        Badge,
        Button,
        Checkbox,
        Container,
        Drawer,
        FormLabel,
        Icon,
        Input,
        Modal,
        Popover,
        Radio,
        Select,
        Skeleton,
        Tooltip,

        // project components
        App,
        Breadcrumb,
        Header,
        Footer,
        CheckoutFooter,
        LinksList,
        ListMenu,
        DrawerMenu,
        NestedAccordion,
        LocaleSelector,
        OfflineBanner,
        SocialIcons,
        Pagination,
        ProductTile,
        SwatchGroup,
        ImageGallery
    }
}

export default extendTheme(overrides)
