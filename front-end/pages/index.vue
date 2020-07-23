<template>
    
</template>

<script>
    export default {
        mounted(){
            if(process.client) this.$navTo("/zones")
        }
    }
</script>