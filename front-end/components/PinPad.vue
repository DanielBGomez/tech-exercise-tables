<template>
    <div class="pinpad" @keyup.delete="removeLastDigit">
        <div class="inputs white margin-l--bottom gray-text text-darken-2">
            <input v-for="(value, index) in values" :key="index"
                :ref="`input-${index}`" @input.prevent="parseDigit" @focus="parseFocus"
                type="password" maxlength="1" :value="value" :disabled="disabled || loading" :autofocus="!index"
                class="white padding-xl--y"
                 />
        </div>
        <div class="pad white">
            <div class="numbers white darken-2 gray-text text-darken-1">
                <div class="number" :class="{ disabled: disabled || loading }" data-value="1" @click="appendDigit(1)" />
                <div class="number" :class="{ disabled: disabled || loading }" data-value="2" @click="appendDigit(2)" />
                <div class="number" :class="{ disabled: disabled || loading }" data-value="3" @click="appendDigit(3)" />
                <div class="number" :class="{ disabled: disabled || loading }" data-value="4" @click="appendDigit(4)" />
                <div class="number" :class="{ disabled: disabled || loading }" data-value="5" @click="appendDigit(5)" />
                <div class="number" :class="{ disabled: disabled || loading }" data-value="6" @click="appendDigit(6)" />
                <div class="number" :class="{ disabled: disabled || loading }" data-value="7" @click="appendDigit(7)" />
                <div class="number" :class="{ disabled: disabled || loading }" data-value="8" @click="appendDigit(8)" />
                <div class="number" :class="{ disabled: disabled || loading }" data-value="9" @click="appendDigit(9)" />
                <div class="number empty" />
                <div class="number" :class="{ disabled: disabled || loading }" data-value="0" @click="appendDigit(0)" />
                <div class="number empty" />
            </div>
            <div class="actions white-text gray lighten-3">
                <div class="action orange" :class="{ disabled: disabled || loading }" data-icon="backspace" data-label="Corregir" @click="removeLastDigit"></div>
                <div class="action red lighten-1" :class="{ disabled: disabled || loading }" data-icon="cancel" data-label="Cancelar" @click="cancel"></div>
                <div class="action green double-height" :class="{ disabled: disabled || loading || internalValue.length != digits, loading }" data-icon="send" data-label="Enviar" @click="send"></div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: "PinPad",
        inheritAttrs: false,
        props: {
            disabled: Boolean,
            loading: Boolean,
            value: {},
            digits: {
                type: Number,
                default(){
                    return 4
                }
            },
            autoSend: Boolean
        },
        data(){
            return {
                internalValue: `${this.value || ''}`
            }
        },
        computed: {
            values(){
                return Array.from(Array(this.digits)).map((digit, index) => this.internalValue[index] )
            }
        },
        watch: {
            value(){
                // Update internal value if differs from prop
                if(this.value != this.internalValue) this.internalValue = this.value
            },
            internalValue(){
                // Emit input -- Compatibility with v-model
                this.$emit("input", this.internalValue)

                // Auto send
                if(this.autoSend && this.internalValue.length == this.digits) this.send()

                // Parse focus
                this.parseFocus()
            }
        },
        methods: {
            send(){
                // Alias
                this.$emit('send', this.internalValue)
            },
            cancel(){
                // Empty value
                this.internalValue = ""

                // Emit cancel event
                this.$emit("cancel")
            },
            removeLastDigit(){
                // Must have at least a digit
                if(!this.internalValue.length) return console.warn( 'The value is already empty!' )

                // Slice
                this.internalValue = this.internalValue.slice(0, -1)

                return this
            },
            appendDigit(digit) {
                // Must be a digit
                if(!/^\d{1}$/.test(digit)) return console.warn( 'The value provided is not a valid digit!' )

                // Validate length
                if(this.internalValue.length >= this.digits) return console.warn( 'Already reached the max number of digits!' )

                // Append as string
                this.internalValue += `${digit}`

                return this
            },
            parseDigit(event){
                // Must be a digit
                if(!/^\d{1}$/.test(event.target.value)) {
                    // Reset value
                    event.target.value = ""
                    return false
                }

                // Append digit
                return this.appendDigit(event.target.value)
            },
            parseFocus(){
                // The focused input must be equal to the length of the current value
                const focusIndex = this.internalValue.length

                // Focus ref if exists
                const ref = this.$refs[`input-${focusIndex}`]
                if((ref || [])[0]) ref[0].focus()
            }
        }
    }
</script>

<style lang="scss">
    $pinpad-border: rgba(black, 0.2) $xxs solid;

    .pinpad {
        width: 100%;
        font-size: 32px;
        font-weight: 700;

        .inputs,
        .pad {
            box-shadow: 0 2px 10px black;
        }
        .inputs {
            display: flex;

            input {
                width: 0; // This prevents oversizing elements
                border: none;
                flex-grow: 1;
                outline: none;
                flex-shrink: 1;
                text-align: center;
                display: inline-flex;
                border-bottom: $pinpad-border;

                &:nth-of-type(even){
                    background-color: rgba(black, 0.07);
                }
            }
        }
        .pad {
            display: flex;
            width: inherit;

            .numbers {
                width: 75%;
                display: flex;
                flex-wrap: wrap;
    
                .number {
                    @extend .padding-l--y;
                    height: 25%;
                    width: 33.333%;
                    font-size: 32px;
                    cursor: pointer;
                    border-bottom: $pinpad-border;
                    transition: all 30ms linear;
    
                    &:before {
                        content: attr(data-value);
                    }

                    &:hover,
                    &:focus {
                        &:not(.empty){
                            opacity: 0.8;
                            border-bottom-width: 0;
                        }
                    }

                    &.disabled {
                        opacity: 0.4;
                        cursor: not-allowed;
                    }

                    &.empty {
                        cursor: default;

                        &:after {
                            content: '.';
                            user-select: none;
                            color: transparent;
                        }
                    }
    
                    &:nth-of-type(even) {
                        background-color: rgba(black, 0.07);
                    }
                }
            }
            .actions {
                width: 25%;
                display: flex;
                flex-direction: column;

                .action {
                    width: 100%;
                    height: 25%;
                    display: flex;
                    cursor: pointer;
                    flex-direction: column;
                    border-bottom: $pinpad-border;
                    transition: all 30ms linear;

                    &:hover,
                    &:focus {
                        opacity: 0.8;
                        border-bottom-width: 2px;
                    }

                    &.disabled {
                        opacity: 0.4;
                        cursor: not-allowed;
                    }
                    &.double-height {
                        height: 50%;
                    }


                    &:before {
                        @extend .material-icons;
                        content: attr(data-icon);
                        font-size: 32px;
                        padding-top: $xxxs;
                        margin: auto auto 0 auto;
                    }
                    &:after {
                        content: attr(data-label);
                        font-size: 16px;
                        font-weight: 400;
                        margin: $xs auto auto;
                        font-variant: small-caps;
                        text-transform: lowercase;
                    }
                }
            }
        }
    }
</style>