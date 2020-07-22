<template>
    <div class="container">
        <h2>Listado de zonas</h2>
        
    </div>
</template>

<script>
    const jwt = require('jsonwebtoken')

    export default {
        name: "IndexPage",
        mounted(){
            // Has session token?
            const sessionToken = this.$storage.local.get("s_tkn")
            if(!sessionToken) return this.$navTo('/login')

            // Verify token
            jwt.verify(sessionToken, 'some_key', (err, data) => {
                // Redirect to index if valid token
                if(err) this.$navTo('/login') 
            })
        }
    }
</script>