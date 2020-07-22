// Modules
const uuidv4 = require('uuid').v4
const express = require('express')

// Local modules
const Validate = require('../Validate')

// Router
const router = express.Router()

// Routes
// Get zone data
router.get('/zone/:uuid', (req, res) => {
    // Get conn
    req.db.getConnection()
        .then(conn => {
            // Get zone data
            getZone(conn, req.params.code)
                .then(resp => res.send( parseZoneValues(resp) ))
                .catch(err => res.status((err || {}).code || 500).send(err))
                .finally(() => conn.release()) // Release pool connection
        })
        .catch(err => DB_CONN_ERROR(res, err))
})
router.get('/zones', (req, res) => {
    req.db.getConnection()
        .then(conn => {
            // Get zone data
            getZonesQuery(conn, undefined, undefined, { parse: true })
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
                        .then(resp => res.send( parseZoneValues(resp) ))
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

// Funcions
function DB_CONN_ERROR(res, err){
    return res.status(500).send({ code: 500, errKey: "DB_CONN_ERROR", msg: "Error getting a connection from the db!", data: err })
}
function parseZoneValues(zoneData = {}){
    const result = {}

    // Parse values
    Object.keys(zoneData).forEach(column => {
        // Remove prefixes
        const key = column.replace('zone_', '')
        
        // Ignore protected values
        if(['id'].includes(key)) return;

        // Store @ result
        result[key] = zoneData[column]
    })

    // Return resulting obj
    return result
}
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
            .then(resp => {
                // Parse?
                const results = options.parse ? resp[0].map(row => parseZoneValues(row) ) : resp[0]
                // Resolve
                resolve(results)
            })
            .catch(reject)
    })
}

// Export router
module.exports = router
