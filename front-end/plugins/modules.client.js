import Vue from 'vue'

// Configs
Vue.config.productionTip = false

// NPM Modules
const Storage = require('./modules/Storage')

Object.defineProperty(Vue.prototype, "$storage", { value: { local: Storage.Local(), session: Storage.Session() } })
        
// Vue modules
import Toast from 'vue-toastification'
import Modal from 'vue-js-modal'

Vue.use(Toast, {
    position: 'bottom-right',
    tastClassName: [ "toast-element" ]
})
Vue.use(Modal, {
    dynamic: true,
    dynamicDefaults: {
        height: 'auto'
    },
    injectModalsContainer: true
})

// Aditional Functions
Object.defineProperty(Vue.prototype, "$navTo", { value: function(href) {
        // Exit if no href
        if(!href) return;

        // Redirect if external url
        if(href.match('://')) return window.open(href, '_blank')

        // Router href
        if(location.pathname == href) return this.$router.go() // If the URI is the same as the actual one, refresh the page

        this.$router.push(href)
    } })

// DOM Modules
