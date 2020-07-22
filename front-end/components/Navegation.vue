<template>
    <nav id="navegation" class="dark-green white-text padding-m">
        <div class="elements">
            <div class="element margin-no-space padding-s--y" v-for="element in elements" :key="element.slug" :data-icon="element.icon" :data-label="element.label" @click="$navTo(element.href)" />
        </div>
    </nav>
</template>

<script>
    export default {
        name: "Navegation",
        data(){
            return {
                elements: [
                    {
                        slug: "zones",
                        label: "Zonas",
                        icon: "domain",
                        href: "/zones"
                    },
                    {
                        slug: "tables",
                        label: "Mesas",
                        icon: "deck",
                        href: "/tables"
                    },
                    {
                        slug: "logout",
                        label: "Cerrar sesión",
                        icon: "logout",
                        href: "/logout"
                    }
                ]
            }
        }
    }
</script>

<style lang="scss">
    #navegation {
        width: 96px;
        height: 100%;

        .elements {
            height: 100%;
            display: flex;
            flex-direction: column;

            .element {
                width: 100%;
                cursor: pointer;
                text-align: center;
                flex-direction: column;
                transition: all 100ms linear;

                &:before {
                    @extend .material-icons;
                    content: attr(data-icon);
                    font-size: 32px;
                }
                &:after {
                    content: attr(data-label);
                    font-weight: 500;
                    font-variant: small-caps;
                    text-transform: lowercase;
                }

                &.active,
                &:focus,
                &:hover {
                    opacity: 0.7;
                }

                &:last-child {
                    margin-top: auto;
                }
            }
        }
    }
</style>