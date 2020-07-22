<template>
    <div id="app">
        <Navegation class="default-navegation margin-no-space" />
        <Nuxt class="default-container margin-no-space padding-xl--x padding-m--top padding-xxl--bottom white darken-3" />
    </div>
</template>

<script>
    const jwt = require('jsonwebtoken')

    import Navegation from '~/components/Navegation'

    export default {
        name: "default",
        mounted(){
            // Has session token?
            const sessionToken = this.$storage.local.get("s_tkn")
            if(!sessionToken) return this.$navTo('/login')

            // Verify token
            jwt.verify(sessionToken, 'some_key', (err, data) => {
                // Redirect to index if valid token
                if(err) this.$navTo('/login') 
            })
        },
        components: {
            Navegation
        }
    }
</script>

<style lang="scss">
    @import '~/assets/styles.scss';

    #app {
        display: flex;
        flex-direction: row;
        
        .default-navegation {
            flex-grow: 0;
            flex-shrink: 0;
        }
        .default-container {
            flex-grow: 1;
            flex-shrink: 1;

            > h2 {
                @extend .custom-spacing, .margin-no-space--top, .margin-l--bottom, .gray-text, .text-darken-1;
            }
        }
    }
</style>
