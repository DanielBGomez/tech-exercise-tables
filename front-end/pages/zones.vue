<template>
    <div class="container">
        <h2>Listado de zonas</h2>
        <div class="elements">
            <div class="zone-card white" v-for="zone in zones" :key="zone.uuid" >
                <div class="image" :style="{ backgroundImage: `url('${zone.image}')` }">
                </div>
                <div class="name padding-m--x padding-s--y gray-text">{{ zone.name }}</div>
            </div>
        </div>
        <FloatingAction @click="floatingAction" />
    </div>
</template>

<script>
    const jwt = require('jsonwebtoken')

    import FloatingAction from '~/components/FloatingAction'
    import CreateZoneModal from '~/components/modals/CreateZone'

    export default {
        name: "IndexPage",
        asyncData(context){
            return new Promise((resolve, reject) => {
                context.app.$api.get({
                        endpoint: "zones"
                    })
                    .then(zones => resolve({ zones }))
                    .catch(err => {
                        console.log(err)
                        context.error({ statusCode: 400, message: 'No he podido conectar con el servidor' })
                    })
            })
        },
        methods: {
            floatingAction(){
                this.$modal.show(CreateZoneModal, {}, { classes: ['fit-content'] })
            }
        },
        components: {
            FloatingAction
        }
    }
</script>

<style lang="scss" scoped>
    .container {
        .elements {
            width: 100%;
            display: flex;
            flex-wrap: wrap;

            .zone-card {
                margin-right: $m;
                width: calc(25% - 12px);
                box-shadow: 0 3px 5px rgba(black, 0.2);

                &:nth-of-type(4n) {
                    margin-right: 0;
                }

                .image {
                    @include img(75%);
                    width: 100%;
                    position: relative;

                    &:after {
                        @extend .main;
                        content: '';
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        opacity: 0.2;
                        position: absolute;
                    }
                }
                .name {
                    
                    &:before {
                        @extend .material-icons;
                        content: 'label';
                        opacity: 0.8;
                        font-size: 20px;
                        margin-right: $xs;
                        vertical-align: middle;
                    }
                }
            }
        }
    }
</style>