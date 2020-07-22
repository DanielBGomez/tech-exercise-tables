<template>
    <div class="input-element" :data-status="status" :required="required" :type="type">
        <label :for="uuid" :required="required">{{ label }}</label>
        <textarea ref="textarea" v-if="type == 'textarea'" :value="value" :placeholder="placeholder"  :minlength="min" :maxlength="max" v-on="inputListeners" />
        <input v-else-if="type == 'number'" type="number" :id="uuid" :min="min" :max="max" :value="value" :placeholder="placeholder" :disabled="disabled" v-on="inputListeners" />

        <select v-else-if="type == 'select'" :id="uuid" :disabled="disabled" v-on="inputListeners">
            <option>Selecciona una opción</option>
            <option disabled> </option>
            <template v-if="isGroup">
                <optgroup v-for="(option, index) in parsedGroupElements" :key="index" :label="option.label || option[customLabel] || option.slug || '-----------'" >
                    <option v-for="(suboption, subindex) in option.parsedElements" :key="suboption.slug || subindex" 
                        :value="suboption[customValue] || suboption.value || suboption.slug || suboption">{{ suboption[customLabel] || suboption.label || suboption }}</option>
                    <option disabled> </option>
                </optgroup>
            </template>
            <template v-else>
                <option v-for="(option, index) in parsedElements" :key="option.slug || index" :value="option[customValue] || option.value || option.slug || option">{{ option[customLabel] || option.label || option }}</option>
            </template>
        </select>

        <input v-else :id="uuid" :value="value" :placeholder="placeholder" :minlength="min" :maxlength="max" :disabled="disabled" v-on="inputListeners" />
    </div>
</template>

<script>
    import autosize from 'autosize'

    export default {
        name: "InputElement",
        inheritAttrs: false,
        mounted(){
            if(this.type == "textarea") autosize(this.$refs.textarea)
            
        },
        updated(){
            if(this.type == "textarea") autosize(this.$refs.textarea)
        },
        props: {
            uuid: {
                type: String,
                default(){
                    return this.$uuid()
                }
            },
            disabled: Boolean,
            required: Boolean,
            validator: {
                type: [RegExp, Function, String, Object],
                default(){
                    return 'string'
                }
            },
            label: {
                type: String,
                default(){
                    return "Label"
                }
            },
            type: {
                type: String,
                default(){
                    return 'text'
                },
                validator(val){
                    if(!val) return true
                    return ["text", "select", "number", "textarea"].includes(val)
                }
            },
            placeholder: String,
            value: {},

            min: Number,
            max: Number,
            step: Number,

            elements: [Array, Object],
            columns: Number,
            isGroup: Boolean,

            customLabel: String,
            customValue: String,
            customSubElements: String
        },
        computed: {
            parsedElements(){
                return Array.isArray(this.elements) ? this.elements : Object.keys(this.elements).map(key => this.elements[key])
            },
            parsedGroupElements(){
                return this.parsedElements.map(group => {
                    // Elements
                    const elements = group.elements || group[customSubElements]

                    // Parse as array or object
                    group.parsedElements = Array.isArray(elements) ? elements : Object.keys(elements).map(key => elements[key])

                    return group
                })
            },
            inputListeners(){
                 var vm = this
                // `Object.assign` merges objects together to form a new object
                return Object.assign({},
                    // We add all the listeners from the parent
                    this.$listeners,
                    // Then we can add custom listeners or override the
                    // behavior of some listeners.
                    {
                        // This ensures that the component works with v-model
                        input: function (event) {
                            switch(vm.type){
                                case 'number':
                                    return vm.$emit('input', parseFloat(event.target.value))
                                default:
                                    return vm.$emit('input', event.target.value)
                            }
                        }
                    }
                )
            }
        },
        data(){
            return {
                status: 'initial',
                initialValue: this.value
            }
        },
        watch: {
            value(){
                // Reset status if value is undefined
                if(typeof this.value == "undefined") return this.status = 'initial'
                // For optional parameters, reset status if empty
                if(this.value == '' && !this.required) return this.status = 'initial'
                // Status
                this.status = this.validate() != false ? 'valid' : 'invalid'
            }
        },
        methods: {
            validate(){
                switch(typeof this.validator){
                    case 'string':
                        try {
                            return this.$validate[this.validator](this.value)
                        } catch {
                            return false
                        }
                    case 'object':
                        // Is regexp?
                        try {
                            if(this.validator instanceof RegExp) return this.validator.test(this.value)
                        } catch {}
                        try {
                            // Simple obj
                            return this.$validate[this.validator.type || 'string'](this.value, this.validator) // as options
                        } catch {
                            return false
                        }
                    case 'function':
                        return this.validator(this.value)
                    default:
                        return false
                }
            }
        },
        components: {
        }
    }
</script>

<style lang="scss">
    .input-element {
        @extend .margin-m--bottom;
        width: 100%;
        text-align: left;

        label {
            @extend .margin-xxs--bottom, .gray-text;
            width: 100%;
            font-size: 16px;
            font-weight: 700;
            display: inline-block;
            font-variant: small-caps;
            text-transform: lowercase;
            font-family: 'Roboto', sans-serif;

            &[required]:after {
                @extend .red-text;
                content: ' *';
            }
        }
        input,
        select,
        textarea {
            @extend .padding-s;
            width: 100%;
            border: none;
            outline: none;
            font-size: 14px;
            border-bottom: $color-gray-30 4px solid;
            transition: all 200ms linear;

            &:focus {
                border-bottom-color: lighten($color-main, 20);
            }
        }

        &[data-status=valid] {
            input,
            select,
            textarea {
                border-bottom-color: lighten($color-green, 20);
            }
        }
        &[data-status=invalid] {
            input,
            select,
            textarea {
                border-bottom-color: lighten($color-red, 10);
            }
        }
    }
</style>