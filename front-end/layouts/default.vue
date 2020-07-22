<template>
    <div id="app">
        <Navegation class="default-navegation margin-no-space" />
        <Nuxt class="default-container margin-no-space padding-xl--x padding-m--top padding-xxl--bottom white darken-3" />
    </div>
</template>

<script>
    import Navegation from '~/components/Navegation'

    export default {
        name: "default",
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
