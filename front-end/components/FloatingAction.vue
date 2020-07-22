<template>
    <div class="floating-action margin-xl--right margin-xl--bottom orange white-text" :data-icon="icon" :class="[disabled]" @click="!disabled ? $emit('click', $event) : ''" />
</template>

<script>
    export default {
        name: "FloatingAction",
        props: {
            disabled: Boolean,
            icon: {
                type: String,
                default(){
                    return "add"
                }
            }
        }
    }
</script>

<style lang="scss">
    .floating-action {
        right: 0;
        bottom: 0;
        width: 60px;
        height: 60px;
        display: flex;
        position: fixed;
        cursor: pointer;
        border-radius: 50%;
        box-shadow: 0 5px 10px rgba(black, 0.5);
        
        &:before {
            @extend .material-icons;
            content: attr(data-icon);
            margin: auto;
            font-size: 32px;
            display: inline-block;
        }
    }
</style>