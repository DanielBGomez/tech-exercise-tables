<template>
    <div class="container margin-auto">
        <div class="user" v-if="user">
            <div class="img" :style="{ backgroundImage: `url('${user.image}')` }" />
        </div>
        <h2 class="white-text custom-spacing margin-m--bottom">{{ this.user ? "Ingresa tu clave de acceso" : "Ingresa tu código de usuario" }}</h2>
        <PinPad v-model="currentCode" :autoSend="true" :loading="loading" @send="send" @cancel="cancel" />
    </div>
</template>

<script>
    const jwt = require('jsonwebtoken')
    const sha512 = require('js-sha512')

    import PinPad from '~/components/PinPad'

    export default {
        name: "LoginPage",
        layout: "cover",
        mounted(){
            // Has session token?
            const sessionToken = this.$storage.local.get("s_tkn")
            if(sessionToken){
                // Verify token
                jwt.verify(sessionToken, 'some_key', (err, data) => {
                        // Redirect to index if valid token
                        if(!err) this.$navTo('/') 
                    })
            }
        },
        data(){
            return {
                loading: false,

                currentCode: "",
                padScope: "user",
                user: false,
                token: false
            }
        },
        methods: {
            cancel(){
                // Scoped cancel
                switch(this.padScope){
                    case 'auth':
                        // Reset 
                        this.user = false
                        this.token = false
                        this.padScope = "user"
                        this.currentCode = ""
                }
            },
            send(code){
                // Exit if already loading
                if(this.loading) return;

                // Set loading state
                this.loading = true

                // Define query by scope
                const query = this.padScope == "user" ? this.getUserData(code) : this.authUser(this.user.code, code )

                // Parse query
                query.then(resp => {
                        // Parse response
                        if(this.padScope == "user") {
                            // Store user
                            this.user = resp
                            // Update scope
                            this.padScope = "auth"
                        } else {
                            // Parse token
                            jwt.verify(resp.token, 'some_key', (err, data) => {
                                    if(err) return this.$toast.error("El servidor respondió con una sesión no válida!")
                                    
                                    // Store token
                                    this.$storage.local.save('s_tkn', resp.token)

                                    // Redirect
                                    this.$navTo("/")
                                })
                        }
                    })
                    .catch(err => {
                        // Parse errData
                        const errData = ((err || {}).err || {}).data || {}
                        // Default msg
                        let msg = 'Ocurrió un error inesperado al consultar al servidor'
                        // Parse
                        switch(errData.errKey){
                            case 'USER_NOT_FOUND':
                                msg = "No existe algún usuario con ese código"
                                break
                        }
                        // Toast
                        this.$toast.error(msg)
                    })
                    .finally(() => {
                        // Reset code
                        this.currentCode = ""
                        // Update loading status
                        this.loading = false
                    })
            },
            getUserData(userCode){
                return new Promise((resolve, reject) => {
                    this.$api.get({
                            endpoint: 'user',
                            path: '{code}',
                            vars: {
                                code: userCode
                            }
                        })
                        .then(resolve)
                        .catch(reject)
                })
            },
            authUser(code, pin){
                return new Promise((resolve, reject) => {
                    this.$api.post({
                            endpoint: 'user',
                            path: 'auth',
                            data: {
                                code,
                                pin: sha512(pin)
                            }
                        })
                        .then(resolve)
                        .catch(reject)
                })
            }
        },
        components: {
            PinPad
        }
    }
</script>

<style lang="scss" scoped>
    .container {
        width: 80%;
        max-width: 500px;

        .user {
            .img {
                @include img(100%);
                width: 150px;
                border-radius: 50%;
            }
        }

        h2 {
            text-align: left;
        }
    }
</style>