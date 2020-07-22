const QueryString = require('query-string')

class ApiV2 {
    constructor(params = {}){
        this._axios = params.axios

        this.lang = params.lang || {}

        // API server
        this.server = params.server || 'http://localhost:3100'
        this.version = params.version || 'v2'
        // Auth token
        this.token = params.token || ''
        // Valid Request methods
        this.validMethods = params.validMethods || ['GET','POST','PUT','DELETE']
        // Default data
        this.defaultVars = params.defaultVars || {}
        this.defaultParams = params.defaultParams || {}

        // Fingerprint
        this.lastFingerPrint

        // Timeout
        this.timeout = params.timeout || 15000

        // Requests stack
        this.requests = {}
    }
    /**
     * 
     * @param {String} endpoint     API Endpoint 
     * @param {String} path         Request path
     * @param {Object} vars         Path variables
     * @param {Object} params       Request parameters
     * 
     * @returns {String} Full request URL
     * 
     * @todo Sanitize vars
     */
    buildURL(endpoint, path = '', vars = {}, params = {}){
        // Has endpoint?
        if(typeof endpoint == "undefined") throw "No endpoint provided when building URL"

        // Base
        let url = `${this.server}/${endpoint}`
        // Path
        if(path) {
            if(vars) {
                // Merge with default vars
                vars = {...this.defaultVars, ...vars}
                // Replace vars @
                Object.keys(vars).map( key => {
                    path = path.replace(`{${key}}`, vars[key])
                })
            }
            url += `/${path}`
        }
        // Params
        url += this.buildParams(params)

        // All done!
        return url
    }
    buildParams(params = {}){
        // Merge with default params
        params = QueryString.stringify( {...this.defaultParams, ...params} )
        return params ? `?${params}` : ''
    }
    get(data = {}){
        data.method = 'GET'
        return this.httpRequest(data)
    }
    post(data = {}){
        data.method = 'POST'
        return this.httpRequest(data)
    }
    put(data = {}){
        data.method = 'PUT'
        return this.httpRequest(data)
    }
    delete(data = {}){
        data.method = 'DELETE'
        return this.httpRequest(data)
    }
    httpRequest(requestData){
        let { method = 'GET', endpoint, path = '', vars = {}, data = {}, params = {}, auth, mime = 'application/json', errorMSG, handleErrors = true} = requestData
        // this.server + endpoint [+ path] + token
        return new Promise((resolve, reject) => {
            let url
            // Create URL
            try {
                url = this.buildURL(endpoint, path, vars, params)
            } catch (err) {
                // Error building URL
                return reject(err)
            }
            // Validate method
            method = method.toUpperCase()
            if(this.validMethods.indexOf(method) == "-1") return reject( "Method not Allowed" )
            if(method == "GET" || method == "DELETE"){
                data = undefined
            }

            // Set headers
            let headers = {}
            if(auth) headers['Authorization'] = 'Bearer ' + auth

            // HTTP Query
            this._axios({
                    url,
                    method,
                    data,
                    contentType: (typeof data == 'object') ? `${mime}; charset=utf-8` : undefined,
                    dataType: 'json',
                    json: true,
                    headers,
                    timeout: this.timeout,
                    cache : (method == "GET") ? false : undefined,
                })
                .then(res => resolve(res.data))
                .catch(err => reject(handleErrors ? this.handleErrors(err.response, errorMSG) : err.response))
        })
    }

    handleErrors(err, errorMSG = this.lang){
        const data = {
            code: err.status || 500,
            msg: errorMSG[err.status] || err.msg || "Internal Server Error",
            err
        }

        switch(err.status){
            case 0:
                data.status = 0

                switch(err.statusText){
                    case 'timeout':
                        data.msg = errorMSG.TIMEOUT || 'Timeout'
                        break
                    case 'error':
                        data.msg = errorMSG.ERROR || 'Connection error'

                        console.log(errorMSG.ERROR)

                        break
                    }
        }

        return data
    }
}

module.exports = params => new ApiV2(params)
module.exports.Class = ApiV2