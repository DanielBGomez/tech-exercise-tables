module.exports = {
    DB_CONN_ERROR: (res, err) => {
        return res.status(500).send({ code: 500, errKey: "DB_CONN_ERROR", msg: "Error getting a connection from the db!", data: err })
    },
    parseValues: (row = {}, options = {}) => {
        const result = {}
    
        // Parse options.values
        if(options.values) options.values = options.values.split(/\s*,\s*/g)

        // Parse values
        Object.keys(row).forEach(column => {
            // Ignore nulls
            if(row[column] == null) return;

            // Remove prefixes and _id suffix
            const key = column.replace(options.prefix, '')

            // Is sub-obj?
            try {

                if(/\_/.test(key)) {
                    const parsedKey = key.split(/\_/)
    
                    // Filter parsed key
                    if(options.values) {
                        if(!options.values.includes(parsedKey[0])) return;
                    }
    
                    // Create object if doesn't exists
                    if(!result[parsedKey[0]]) result[parsedKey[0]] = {}
    
                    // Store sub value
                    return result[parsedKey[0]][parsedKey[1]] = row[column]
                }
            } catch(err) {
                console.log(err)
            }
    
            // Filter values
            if(options.values) {
                if(!options.values.includes(key)) return;
            }
    
            // Store @ result
            result[key] = row[column]
        })
    
        // Return resulting obj
        return result
    }
}