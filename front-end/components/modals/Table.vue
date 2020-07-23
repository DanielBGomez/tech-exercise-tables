<template>
    <form class="create-table white darken-3 padding-m padding-l--x" @submit.prevent="submit">
        <h3 class="custom-spacing margin-no-space--top margin-l--bottom gray-text text-darken-2">{{ data ? "Modificar" : "Registrar" }} mesa</h3>
        <InputElement type="text" label="Nombre de la mesa" :min="1" :max="64" :validator="validators.name" placeholder="Ej.: Terraza" v-model="name" required :disabled="loading" />
        <InputElement type="select" label="Zona" :elements="zones" customLabel="name" customValue="id" :validator="validators.zone" v-model="zone" required :disabled="loading" />
        <InputElement type="select" label="Estado de la mesa" :elements="availableStatus" v-model="status" :disabled="loading" />
        <button :disabled="loading">{{ data ? "Actualizar" : "Registrar" }} mesa</button>
        <button class="red--important lighten-2 margin-xxl--top--important" v-if="data" :disabled="loading || data.status == 1" @click.prevent="data.status != 1 ? archive(data.uuid) : ''">Borrar mesa</button>
        <div class="cancel" @click="$emit('close')">Cancelar y salir</div>
    </form>
</template>

<script>
    import InputElement from '~/components/InputElement'

    export default {
        name: "TableModal",
        mounted(){
            this.getZones() 
                .then(zones => this.zones = zones )
                .catch(err => {
                    // Ignore
                })
        },
        props: {
            data: [Object, Boolean]
        },
        data(){
            return {
                loading: false,
                fetching: false,

                name: (this.data || {}).name,
                zone: ((this.data || {}).zone || {}).id,
                status: (this.data || {}).status || 0,

                zones: [],
                availableStatus: [
                    {
                        slug: "0",
                        label: "Libre"
                    },
                    {
                        slug: "1",
                        label: "Activa"
                    }
                ],

                validators: {
                    name: {
                        type: "string",
                        length: {
                            min: 1,
                            max: 64
                        }
                    },
                    zone: {
                        type: "number",
                        length: {
                            min: 1
                        }
                    },
                    status: {
                        type: "number",
                        enum: [0,1]
                    }
                }
            }
        },
        methods: {
            getZones(){
                if(this.fetching) return;

                return new Promise((resolve, reject) => {
    
                    this.fetching = true
    
                    this.$api.get({
                            endpoint: "zones",
                            params: {
                                values: "id,uuid,name"
                            }
                        })
                        .then(resolve)
                        .catch(reject)
                        .finally(() => this.fetching = false)
                })
            },
            archive(uuid){
                // Ignore if already loading
                if(this.loading) return false

                this.loading = true

                // Validate
                try {
                    this.$validate.uuid(uuid)
                } catch {
                    this.loading = false
                    // Ignore if uuid is not valid
                    return this.$toast.error("El identificador de la mesa no es válido!")
                }

                // API
                this.$api.delete({
                        endpoint: "table",
                        path: "{uuid}",
                        vars: {
                            uuid
                        }
                    })
                    .then(resp => {
                        this.$toast.success(`Se ha eliminado la mesa correctamente!`)
                        // Reset values
                        this.name = undefined
                        this.image = undefined
                        // Emit close event
                        this.$emit('close')
                        // Emit new element event
                        this.$navTo('/tables')
                    })
                    .catch(err => {
                        // Parse errData
                        const errData = ((err || {}).err || {}).data || {}
                        // Default msg
                        let msg = `Ocurrió un error inesperado al archivar la mesa`
                        // Parse
                        // switch(errData.errKey){
                        // }
                        // Toast
                        this.$toast.error(msg)
                    })
                    .finally(() => {
                        // Reset loading state
                        this.loading = false
                    })
            },
            submit(e){
                // Ignore if already loading
                if(this.loading) return false

                // Get data
                const data = {
                    name: this.$validate.dataInput(this.name, "string", this.validators.name),
                    zone: this.$validate.dataInput(this.zone, "number", this.validators.zone),
                    status: this.$validate.dataInput(this.status, "number", this.validators.status)
                }

                // Is valid?
                try {
                    this.$validate.isValidData(data, ["zone"])
                } catch(errors) {
                    // Toast
                    this.$toast.error(`No pude registrar la mesa porque contiene errores! [${errors.join(', ')}]`)
                    // Reset loading state
                    this.loading = false
                    // Exit
                    return;
                }

                // API Params
                const apiParams = this.data ? {
                        endpoint: "table",
                        path: "{uuid}",
                        vars: {
                            uuid: this.data.uuid
                        },
                        data
                    } : {
                        endpoint: "table",
                        data
                    }

                // Api
                this.$api[this.data ? 'put' : 'post'](apiParams)
                    .then(zone => {
                        this.$toast.success(`Se ha ${this.data ? 'actualizado' : 'registrado'} la mesa correctamente!`)
                        // Reset values
                        this.name = undefined
                        this.image = undefined
                        // Emit close event
                        this.$emit('close')
                        // Emit new element event
                        this.$navTo('/tables')
                    })
                    .catch(err => {
                        // Parse errData
                        const errData = ((err || {}).err || {}).data || {}
                        // Default msg
                        let msg = `Ocurrió un error inesperado al ${this.data ? 'actualizar' : 'registrar'} la mesa`
                        // Parse
                        // switch(errData.errKey){
                        // }
                        // Toast
                        this.$toast.error(msg)
                    })
                    .finally(() => {
                        // Reset loading state
                        this.loading = false
                    })
            }
        },
        components: {
            InputElement
        }
    }
</script>

<style lang="scss">
    .create-table {
        width: 80vw;
        max-width: 350px;
    }
</style>