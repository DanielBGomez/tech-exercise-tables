<template>
    <div class="container">
        <h2>Listado de mesas</h2>
        <InputElement class="filter margin-xxl--bottom" type="select" label="Filtrar mesas" validator="number" :elements="filters" v-model="filterStatus" />
        <div class="elements margin-xxl--bottom" v-for="zone in zones" :key="zone.id" :data-label="zone.name">
            <div class="table-card white" v-for="table in zone.tables" :key="table.uuid" :status="table.status" @click="openTableModal(table)" >
                <div class="name padding-m--x padding-l--y gray-text">{{ table.name }}</div>
            </div>
        </div>
        <FloatingAction @click="openTableModal()" />
    </div>
</template>

<script>
    const jwt = require('jsonwebtoken')

    import InputElement from '~/components/InputElement'
    import FloatingAction from '~/components/FloatingAction'
    import TableModal from '~/components/modals/Table'

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
        data() {
            return {
                filters: [
                    {
                        slug: -1,
                        label: "Todas"
                    },
                    {
                        slug: 0,
                        label: "Libres"
                    },
                    {
                        slug: 1,
                        label: "Activas"
                    }
                ],
                filterStatus: -1
            }
        },
        computed: {
            filteredTables(){
                return this.filterStatus == -1 ? this.tables : this.tables.filter(table => table.status == this.filterStatus)
            },
            zones(){
                const zones = {
                    '-1': {
                        id: -1,
                        name: 'Sin zona',
                        tables: []
                    }
                }

                Array.from(this.filteredTables).forEach(table => {
                    // Table is assigned?
                    if(table.zone) {
                        // Create zone if doesn't exist already
                        if(!zones[table.zone.id]) zones[table.zone.id] = {...table.zone, tables: [] }
                        // Store at zone
                        zones[table.zone.id].tables.push(table)
                    } else {
                        // Store at undefined
                        zones[-1].tables.push(table)
                    }
                })

                return zones
            }
        },
        methods: {
            openTableModal(data = false){
                this.$modal.show(TableModal, { data }, { classes: ['fit-content'] })
            }
        },
        components: {
            InputElement,
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

            &:last-child {
                @extend .margin-no-space--bottom;
            }

            &:before {
                @extend .margin-s--bottom, .gray-text, .text-lighten-1;
                content: 'Zona: ' attr(data-label);
                width: 100%;
                font-size: 18px;
                font-weight: 700;
            }

            .table-card {
                cursor: pointer;
                margin-right: $m;
                width: calc(25% - 12px);
                box-shadow: 0 3px 5px rgba(black, 0.2);

                &:nth-of-type(4n) {
                    margin-right: 0;
                }

                &[status='1'] {
                    @extend .orange, .lighten-7;
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