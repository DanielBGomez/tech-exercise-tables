export default function(req, res, next){
    if(!process.client) {
        // Modules
        const fs = require('fs-extra')
        const path = require('path')
        const url = require('url')

        // 
        const URL = url.parse(req.url, true)
        if(req.method == 'GET' && URL.pathname == '/get-config') {

            // File to lookup
            const FILE = URL.query.file
            if(!FILE) return res.writeHead(400, {
                        'Content-Type': 'application/json'
                    })
                    .end(JSON.stringify({ code: 400, msg: "You must define a config file to query", errKey: "MISSING_PARAMS" }))

            // Exist in config folder as a public file?
            const CONFIG_FILE = ( fs.readdirSync( path.resolve( 'configs') ) || [] ).find(FILE_NAME => new RegExp(`^${FILE}\.public\.(?:js|json)$`).test(FILE_NAME))
            if(!CONFIG_FILE) return res.writeHead(404, {
                    'Content-Type': 'application/json'
                })
                .end(JSON.stringify({ code: 404, msg: "The requested config file doesn't exist or isn't labeled as public", data: { file: FILE }, errKey: "FILE_NOT_FOUND" }))

            // File exist, is JSON or JS?
            if( /.+\.js$/.test(CONFIG_FILE) ) {
                // Is JS File -- Require as module
                const FILE_DATA = require(`~/configs/${CONFIG_FILE}`)

                // Send data
                return res.writeHead(200, {
                        'Content-Type': 'application/json'
                    })
                    .end(JSON.stringify(FILE_DATA))

            } else {
                // Is JSON file -- Read file
                const FILE_DATA = fs.readFileSync( path.join( 'configs', CONFIG_FILE ) )

                // Send data
                return res.writeHead(200, {
                        'Content-Type': 'application/json'
                    })
                    .end(FILE_DATA)
            }

        }
    }
    next()
}