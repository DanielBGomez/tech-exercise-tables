<template>
    <div class="container">
        <h2>Listado de mesas</h2>
        <div class="elements">
            <div class="table-card white" v-for="table in tables" :key="table.uuid" :status="table.status" >
                <div class="name padding-m--x padding-l--y gray-text">{{ table.name }}</div>
            </div>
        </div>
        <FloatingAction @click="floatingAction" />
    </div>
</template>

<script>
    const jwt = require('jsonwebtoken')

    import FloatingAction from '~/components/FloatingAction'
    import CreateTableModal from '~/components/modals/CreateTable'

    export default {
        name: "TablesPage",
        asyncData(context){
            return new Promise((resolve, reject) => {
                context.app.$api.get({
                        endpoint: "tables"
                    })
                    .then(tables => resolve({ tables }))
                    .catch(err => {
                        console.log(err)
                        context.error({ statusCode: 400, message: 'No he podido conectar con el servidor' })
                    })
            })
        },
        methods: {
            floatingAction(){
                this.$modal.show(CreateTableModal, {}, { classes: ['fit-content'] })
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

            .table-card {
                margin-right: $m;
                width: calc(25% - 12px);
                box-shadow: 0 3px 5px rgba(black, 0.2);

                &:nth-of-type(4n) {
                    margin-right: 0;
                }

                &[status='1'] {
                    @extend .red, .lighten-8;
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
                        content: 'deck';
                        opacity: 0.8;
                        font-size: 20px;
                        margin-right: $s;
                        vertical-align: bottom;
                    }
                }
            }
        }
    }
</style>