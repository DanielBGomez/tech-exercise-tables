<template>
    <div id="app" class="dark-green padding-xxxxl--y">
        <div class="cover" :style="{ backgroundImage: `url('${cover}')` }"></div>
        <nuxt class="cover-container" />
    </div>
</template>

<script>
    const COVER_PHOTO = require('~/configs/cover-photo.public.js')

    export default {
        name: "cover",
        data(){
            return {
                cover: COVER_PHOTO
            }
        }
    }
</script>

<style lang="scss">
    @import '~/assets/styles.scss';

    #app {
        display: flex;
        position: relative;

        .cover {
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            opacity: 0.6;
            position: absolute;
            background-size: cover;
        }
        .cover-container {
            z-index: 1;
            position: relative;
            text-align: center;
        }
    }
</style>