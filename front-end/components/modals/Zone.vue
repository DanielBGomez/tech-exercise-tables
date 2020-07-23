<template>
    <form class="create-zone white darken-3 padding-m padding-l--x" @submit.prevent="submit">
        <h3 class="custom-spacing margin-no-space--top margin-l--bottom gray-text text-darken-2">{{ data ? "Modificar" : "Registrar" }} zona</h3>
        <InputElement type="text" label="Nombre de la zona" :min="1" :max="64" :validator="validators.name" placeholder="Ej.: Terraza" v-model="name" required :disabled="loading" />
        <InputElement type="text" label="Imagen de la zona" :min="1" :max="512" :validator="validators.image" placeholder="Url de la imagen" v-model="image" required :disabled="loading" />
        <div class="cover white" :style="{ backgroundImage: `url('${image}')` }" />
        <button :disabled="loading">{{ data ? "Actualizar" : "Registrar" }} zona</button>
        <button class="red--important lighten-2 margin-xxl--top--important" v-if="data" :disabled="loading" @click.prevent="archive(data.uuid)">Borrar zona</button>
        <div class="cancel" @click="$emit('close')">Cancelar y salir</div>
    </form>
</template>

<script>
    import InputElement from '~/components/InputElement'

    export default {
        name: "ZoneModal",
        props: {
            data: [Object, Boolean]
        },
        data(){
            return {
                loading: false,
                name: (this.data || {}).name,
                image: (this.data || {}).image,

                validators: {
                    name: {
                        type: "string",
                        length: {
                            min: 1,
                            max: 64
                        }
                    },
                    image: {
                        type: "image"
                    }
                }
            }
        },
        methods: {
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
                    return this.$toast.error("El identificador de la zona no es válido!")
                }

                // API
                this.$api.delete({
                        endpoint: "zone",
                        path: "{uuid}",
                        vars: {
                            uuid
                        }
                    })
                    .then(resp => {
                        this.$toast.success(`Se ha eliminado la zona correctamente!`)
                        // Reset values
                        this.name = undefined
                        this.image = undefined
                        // Emit close event
                        this.$emit('close')
                        // Emit new element event
                        this.$navTo('/zones')
                    })
                    .catch(err => {
                        // Parse errData
                        const errData = ((err || {}).err || {}).data || {}
                        // Default msg
                        let msg = `Ocurrió un error inesperado al archivar la zona`
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
                    image: this.$validate.dataInput(this.image, "image", this.validators.image)
                }

                // Is valid?
                try {
                    this.$validate.isValidData(data)
                } catch(errors) {
                    // Toast
                    this.$toast.error(`No pude registrar la zona porque contiene errores! [${errors.join(', ')}]`)
                    // Reset loading state
                    this.loading = false
                    // Exit
                    return;
                }

                // API Params
                const apiParams = this.data ? {
                        endpoint: "zone",
                        path: "{uuid}",
                        vars: {
                            uuid: this.data.uuid
                        },
                        data
                    } : {
                        endpoint: "zone",
                        data
                    }

                // Api
                this.$api[this.data ? 'put' : 'post'](apiParams)
                    .then(zone => {
                        this.$toast.success(`Se ha ${this.data ? 'actualizado' : 'registrado'} la zona correctamente!`)
                        // Reset values
                        this.name = undefined
                        this.image = undefined
                        // Emit close event
                        this.$emit('close')
                        this.$navTo('/zones')
                    })
                    .catch(err => {
                        // Parse errData
                        const errData = ((err || {}).err || {}).data || {}
                        // Default msg
                        let msg = `Ocurrió un error inesperado al ${this.data ? 'actualizado' : 'registrado'} la zona`
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
    .create-zone {
        width: 80vw;
        max-width: 350px;

        .cover {
            @include img(75%);
            width: 100%;
        }
    }
</style>