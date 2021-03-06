// Modules
const uuidv4 = require('uuid').v4
const express = require('express')

// Local modules
const Validate = require('../Validate')
const { DB_CONN_ERROR, parseValues } = require('../Functions')

// Router
const router = express.Router()


///////////////////////////
/////     Routes      /////
///////////////////////////

// Get zone data
router.get('/zone/:uuid', (req, res) => {
    // Get conn
    req.db.getConnection()
        .then(conn => {
            // Get zone data
            getZone(conn, req.params.code)
                .then(resp => res.send( parseValues(resp, { prefix: "zone_" }) ))
                .catch(err => res.status((err || {}).code || 500).send(err))
                .finally(() => conn.release()) // Release pool connection
        })
        .catch(err => DB_CONN_ERROR(res, err))
})
router.get('/zones', (req, res) => {
    req.db.getConnection()
        .then(conn => {
            // Get zone data
            getZonesQuery(conn, undefined, undefined, { ...req.query, parse: true })
                .then(resp => res.send( resp ))
                .catch(err => res.status((err || {}).code || 500).send(err))
                .finally(() => conn.release()) // Release pool connection
        })
        .catch(err => DB_CONN_ERROR(res, err))
})

// Create new zone
router.post('/zone', (req, res) => {
    // Get connection
    req.db.getConnection()
        .then(conn => {
            // Create zone
            createZone(conn, req.body)
                .then(resp => {
                    req.log(`Zone created with id: ${resp.insertId}`, resp)

                    // Get zone's data
                    getZone(conn, resp.insertId)
                        .then(resp => res.send( parseValues(resp, { prefix: "zone_" }) ))
                        .catch(err => res.status((err || {}).code || 500).send(err))
                })
                .catch(err => {
                    req.log(`Error creating zone`, err)
                    res.status((err || {}).code || 500).send(err)
                })
                // Release pool connection
                .finally(() => conn.release())
        })
        .catch(err => DB_CONN_ERROR(res, err))
})
// Update table
router.put('/zone/:uuid', (req, res) => {
    // Get connection
    req.db.getConnection()
        .then(conn => {
            // Create table
            updateZone(conn, req.params.uuid, req.body)
                .then(resp => {
                    // Get table's data
                    getZone(conn, req.params.uuid)
                        .then(resp => res.send( parseValues(resp, { prefix: "table_" }) ))
                        .catch(err => res.status((err || {}).code || 500).send(err))
                })
                .catch(err => {
                    req.log(`Error updating table`, err)
                    res.status((err || {}).code || 500).send(err)
                })
                // Release pool connection
                .finally(() => conn.release())
        })
        .catch(err => DB_CONN_ERROR(res, err))
})
// Delete zone
router.delete('/zone/:uuid', (req, res) => {
    // Get connection
    req.db.getConnection()
        .then(conn => {
            // Create zone
            archiveZone(conn, req.params.uuid)
                .then(resp => res.send(resp))
                .catch(err => {
                    req.log(`Error deleting zone`, err)
                    res.status((err || {}).code || 500).send(err)
                })
                // Release pool connection
                .finally(() => conn.release())
        })
        .catch(err => DB_CONN_ERROR(res, err))
})


///////////////////////////
/////    Funcions     /////
///////////////////////////

/**
 * Create new zone.
 * 
 * @param {object} conn                 Database pool connection
 * @param {object} zoneData             Zone's data
 * @param {string} [zoneData.uuid]      Zone's UUID (optional)
 * @param {string} zoneData.name        Zone's full name
 * @param {string} zoneData.image       Zone's image url
 * @returns {Promise<object>}
 *  
 */
function createZone(conn, zoneData = {}){
    return new Promise((resolve, reject) => {
        // Destruct params
        const { uuid = uuidv4(), name, image } = zoneData

        // Validate params
        const errors = {}
        try {
            Validate.uuid(uuid, { label: "UUID" })
        } catch(err) { errors.uuid = err }
        try {
            Validate.string(name, { label: "Name", length: { min: 1, max: 255 } })
        } catch(err) { errors.name = err }
        try {
            Validate.image(image)
        } catch(err) { errors.image = err }

        // Reject if has errors
        if(Object.keys(errors).length) return reject({ code: 400, errKey: "INVALID_DATA_PROVIDED", msg: "Invalid data provided", data: errors })

        // Execute query
        conn.execute(`INSERT INTO zones
                        (zone_uuid, zone_name, zone_image)
                    VALUES
                        (?, ?, ?)`, [ uuid, name, image ])
                        .then(resp => resolve(resp[0]))
                        .catch(err => {
                            switch(err.code){
                                case 'ER_DUP_ENTRY':
                                    return reject({ code: 409, errKey: "DUPLICATED_ENTRY", msg: err.sqlMessage, data: err })
                                default:
                                    reject({ code: 500, errKey: "SQL_INSERT_ERROR", msg: "", data: err })
                            }
                        })
    })
}
/**
 * Update table by uuid.
 * 
 * @param {object} conn                 Database pool connection
 * @param {string} uuid                 Zone's UUID
 * @param {object} zoneData             Zone's data
 * @param {string} zoneData.name        Zone's full name
 * @param {string} zoneData.image       Zone's image url
 * @returns {Promise<object>}
 *  
 */
function updateZone(conn, uuid, tableData = {}){
    return new Promise((resolve, reject) => {
        // Destruct params
        const { name, image } = tableData

        // Validate params
        const errors = {}
        try {
            Validate.uuid(uuid, { label: "UUID" })
        } catch(err) { errors.uuid = err }
        try {
            Validate.string(name, { label: "Name", length: { min: 1, max: 255 } })
        } catch(err) { errors.name = err }
        try {
            Validate.image(image)
        } catch(err) { errors.image = err }

        // Reject if has errors
        if(Object.keys(errors).length) return reject({ code: 400, errKey: "INVALID_DATA_PROVIDED", msg: "Invalid data provided", data: errors })

        // Execute query
        conn.execute(`UPDATE 
                        zones
                    SET
                        zone_name = ?,
                        zone_image = ?
                    WHERE
                        zone_uuid = ?`, [ name, image, uuid ])
                        .then(resp => resolve(resp[0]))
                        .catch(err => {
                            switch(err.code){
                                case 'ER_DUP_ENTRY':
                                    return reject({ code: 409, errKey: "DUPLICATED_ENTRY", msg: err.sqlMessage, data: err })
                                default:
                                    reject({ code: 500, errKey: "SQL_UPDATE_ERROR", msg: "", data: err })
                            }
                        })
    })
}
function archiveZone(conn, uuid){
    return new Promise((resolve, reject) => {
        // Validate uuid
        try {
            Validate.uuid(uuid)
        } catch(err) {
            return Promise.reject({ code: 400, errKey: "INVALID_DATA_PROVIDED", msg: "Invalid data provided", data: { unique: "Please provide a valid uuid!" } })
        }

        // Execute query
        conn.execute("DELETE FROM zones WHERE zone_uuid = ?", [ uuid ])
            .then(resp => resolve(resp[0]))
            .catch(err => reject({ code: 500, errKey: "DELETE_QUERY_ERROR", msg: err.sqlMessage, data: err  }))
    })
}
/**
 * 
 * @param {*} conn 
 * @param {*} unique 
 */
function getZone(conn, unique){
    if(!unique) return Promise.reject({ code: 400, errKey: "INVALID_DATA_PROVIDED", msg: "Invalid data provided", data: { unique: "Please provide a unique value!" } })
    // Unique must be a code, uuid or id
    return new Promise((resolve, reject) => {
        // 
        conn.query("SELECT * FROM zones WHERE zone_id = ? OR zone_uuid = ?", [unique, unique])
            .then(resp => {
                // Empty response
                if(!resp[0][0]) return reject({ code: 404, errKey: "USER_NOT_FOUND", msg: "Zone not found", data: { unique } })

                // Resolve zone
                resolve(resp[0][0])
            })
            .catch(reject)
    })
}
/**
 * 
 * @param {*} conn 
 * @param {*} columns 
 * @param {*} uniques 
 * @param {*} options 
 */
function getZonesQuery(conn, columns, uniques, options = {}){
    return new Promise((resolve, reject) => {
        // SQL Query
        const query = 
            `SELECT 
                ${Array.isArray(columns) ? columns.join(", ") : '*'}
            FROM 
                zones
            ${Array.isArray(uniques) ? `
            WHERE
                zone_id IN (${Array.from(uniques).fill("?").join(", ")})
            OR
                zone_uuid IN(${Array.from(uniques).fill("?").join(", ")})` : ''}
            ${options.limit ? `
            LIMIT 
                ${options.limit}` : ''}
            ORDER BY 
                zone_id DESC`.replace(/\s{2,}|\r\n/g, ' ')

        // Parse uniques
        uniques = Array.isArray(uniques) ? [...uniques, ...uniques] : undefined

        // Query
        conn.query(query, uniques)
            .then(async resp => {
                resp = resp[0]

                // Include children?
                if(options.tables) {
                    // SQL query 
                    let tables;
                    try {
                        // Get tables
                        const query = await conn.query(`SELECT * FROM tables WHERE zone_id IN(${Array.from(resp).fill("?").join(', ')})`, resp.map(zone => zone.zone_id))
                        tables = query[0]
                    } catch(err) {
                        console.log(err)
                    }

                    // Parse tables
                    tables.forEach(table => {
                        // get zone
                        const zoneIndex = resp.findIndex(zone => zone.zone_id == table.zone_id)
                        // Create tables array if doesn't exists
                        if(!resp[zoneIndex].tables) resp[zoneIndex].tables = []
                        // Store table
                        resp[zoneIndex].tables.push( parseValues( table, { prefix: 'table_' } ))
                    })
                }
                
                // Parse?
                const results = options.parse ? resp.map(row => parseValues(row, { ...options, prefix: 'zone_' }) ) : resp
                // Resolve
                resolve(results)
            })
            .catch(reject)
    })
}


///////////////////////////
/////     Exports     /////
///////////////////////////

module.exports = router
