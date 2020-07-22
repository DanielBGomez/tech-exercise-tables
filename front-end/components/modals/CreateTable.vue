<template>
    <form class="create-table white darken-3 padding-m padding-l--x" @submit.prevent="submit">
        <h3 class="custom-spacing margin-no-space--top margin-l--bottom gray-text text-darken-2">Registrar mesa</h3>
        <InputElement type="text" label="Nombre de la mesa" :min="1" :max="64" :validator="validators.name" placeholder="Ej.: Terraza" v-model="name" required :disabled="loading" />
        <InputElement type="select" label="Zona" :elements="zones" customLabel="name" customValue="id" :validator="validators.zone" v-model="zone" required :disabled="loading" />
        <button :disabled="loading">Registrar mesa</button>
        <div class="cancel" @click="$emit('close')">Cancelar y salir</div>
    </form>
</template>

<script>
    import InputElement from '~/components/InputElement'

    export default {
        name: "CreateTableModal",
        mounted(){
            this.getZones() 
                .then(zones => this.zones = zones )
                .catch(err => {
                    // Ignore
                })
        },
        data(){
            return {
                loading: false,
                fetching: false,
                name: undefined,
                zone: undefined,
                zones: [],

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
            submit(e){
                // Ignore if already loading
                if(this.loading) return false

                // Get data
                const data = {
                    name: this.$validate.dataInput(this.name, "string", this.validators.name),
                    zone: this.$validate.dataInput(this.zone, "number", this.validators.zone)
                }

                // Is valid?
                try {
                    this.$validate.isValidData(data)
                } catch(errors) {
                    // Toast
                    this.$toast.error(`No pude registrar la mesa porque contiene errores! [${errors.join(', ')}]`)
                    // Reset loading state
                    this.loading = false
                    // Exit
                    return;
                }

                // Post
                this.$api.post({
                        endpoint: "table",
                        data
                    })
                    .then(zone => {
                        this.$toast.success("Se ha registrado la mesa correctamente!")
                        // Reset values
                        this.name = undefined
                        this.image = undefined
                        // Emit close event
                        this.$emit('close')
                        // Emit new element event
                        this.$emit('creation', zone)
                    })
                    .catch(err => {
                        // Parse errData
                        const errData = ((err || {}).err || {}).data || {}
                        // Default msg
                        let msg = 'Ocurrió un error inesperado al registrar la mesa'
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