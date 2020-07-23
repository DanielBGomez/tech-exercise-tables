<template>
    <h1>Cerrando sesión</h1>
</template>

<script>
    export default {
        layout: "default",
        mounted(){
            if(process.client) {
                // Delete token
                this.$storage.local.delete("s_tkn")
    
                // Redirect to login
                this.$navTo('/login')
            }
        }
    }
</script>