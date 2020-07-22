const SERVERS = require('~/configs/servers')

// NPM Modules
const uuid = require('uuid')
const API = require('./modules/Api')
const Validate = require('./modules/Validate')
const Functions = require('./modules/Functions')

export default ({ $axios }, inject) => {
    inject("api", API( { server: SERVERS.API.URL, axios: $axios } ) )
    inject("uuid", uuid )
    inject("fn", Functions )
    inject("validate", Validate )
}

