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

// Get all tables
router.get('/tables', (req, res) => {
    req.db.getConnection()
        .then(conn => {
            // Get table data
            getTablesQuery(conn, undefined, undefined, { ...req.query, parse: true })
                .then(resp => res.send( resp ))
                .catch(err => res.status((err || {}).code || 500).send(err))
                .finally(() => conn.release()) // Release pool connection
        })
        .catch(err => DB_CONN_ERROR(res, err))
})

// Create new table
router.post('/table', (req, res) => {
    // Get connection
    req.db.getConnection()
        .then(conn => {
            // Create table
            createTable(conn, req.body)
                .then(resp => {
                    req.log(`Table created with id: ${resp.insertId}`, resp)

                    // Get table's data
                    getTable(conn, resp.insertId)
                        .then(resp => res.send( parseValues(resp, { prefix: "table_" }) ))
                        .catch(err => res.status((err || {}).code || 500).send(err))
                })
                .catch(err => {
                    req.log(`Error creating table`, err)
                    res.status((err || {}).code || 500).send(err)
                })
                // Release pool connection
                .finally(() => conn.release())
        })
        .catch(err => DB_CONN_ERROR(res, err))
})
// Update table
router.put('/table/:uuid', (req, res) => {
    // Get connection
    req.db.getConnection()
        .then(conn => {
            // Create table
            updateTable(conn, req.params.uuid, req.body)
                .then(resp => {
                    // Get table's data
                    getTable(conn, req.params.uuid)
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
// Delete table
router.delete('/table/:uuid', (req, res) => {
    // Get connection
    req.db.getConnection()
        .then(conn => {
            // Create table
            archiveTable(conn, req.params.uuid)
                .then(resp => res.send(resp))
                .catch(err => {
                    req.log(`Error deleting table`, err)
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
 * Create new table.
 * 
 * @param {object} conn                 Database pool connection
 * @param {object} tableData            Table's data
 * @param {string} [tableData.uuid]     Table's UUID (optional)
 * @param {string} tableData.name       Table's name
 * @param {string} tableData.zone       Table's zone id
 * @param {number} tableData.status     Table's status
 * @returns {Promise<object>}
 *  
 */
function createTable(conn, tableData = {}){
    return new Promise((resolve, reject) => {
        // Destruct params
        let zone = tableData.zone
        const { uuid = uuidv4(), name, status } = tableData

        // Validate params
        const errors = {}
        try {
            Validate.uuid(uuid, { label: "UUID" })
        } catch(err) { errors.uuid = err }
        try {
            Validate.string(name, { label: "Name", length: { min: 1, max: 255 } })
        } catch(err) { errors.name = err }
        try {
            Validate.number(zone, { label: "Zone", length: { min: 1 } })
        } catch {
            zone = null
        } // Ignore zone errors
        try {
            Validate.number(status, { label: "Status", enum: [ 0, 1 ] })
        } catch(err) { errors.status = err }

        // Reject if has errors
        if(Object.keys(errors).length) return reject({ code: 400, errKey: "INVALID_DATA_PROVIDED", msg: "Invalid data provided", data: errors })

        // Execute query
        conn.execute(`INSERT INTO tables
                        (table_uuid, table_name, zone_id, table_status)
                    VALUES
                        (?, ?, ?, ?)`, [ uuid, name, zone, status ])
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
 * @param {string} uuid                 Table's UUID
 * @param {object} tableData            Table's updated data
 * @param {string} tableData.name       Table's name
 * @param {string} tableData.zone       Table's zone id
 * @param {number} tableData.status     Table's status
 * @returns {Promise<object>}
 *  
 */
function updateTable(conn, uuid, tableData = {}){
    return new Promise((resolve, reject) => {
        // Destruct params
        let zone = tableData.zone
        const { name, status } = tableData

        // Validate params
        const errors = {}
        try {
            Validate.uuid(uuid, { label: "UUID" })
        } catch(err) { errors.uuid = err }
        try {
            Validate.string(name, { label: "Name", length: { min: 1, max: 255 } })
        } catch(err) { errors.name = err }
        try {
            Validate.number(zone, { label: "Zone", length: { min: 1 } })
        } catch {
            zone = null
        } // Ignore zone errors
        try {
            Validate.number(status, { label: "Status", enum: [ 0, 1 ] })
        } catch(err) { errors.status = err }

        // Reject if has errors
        if(Object.keys(errors).length) return reject({ code: 400, errKey: "INVALID_DATA_PROVIDED", msg: "Invalid data provided", data: errors })

        // Execute query
        conn.execute(`UPDATE 
                        tables
                    SET
                        table_name = ?,
                        zone_id = ?,
                        table_status = ?
                    WHERE
                        table_uuid = ?`, [ name, zone, status, uuid ])
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
function archiveTable(conn, uuid){
    return new Promise((resolve, reject) => {
        // Validate uuid
        try {
            Validate.uuid(uuid)
        } catch(err) {
            return Promise.reject({ code: 400, errKey: "INVALID_DATA_PROVIDED", msg: "Invalid data provided", data: { unique: "Please provide a valid uuid!" } })
        }

        // Execute query
        conn.execute("DELETE FROM tables WHERE table_uuid = ? AND table_status != ?", [ uuid, 1 ])
            .then(resp => resolve(resp[0]))
            .catch(err => reject({ code: 500, errKey: "DELETE_QUERY_ERROR", msg: err.sqlMessage, data: err  }))
    })
}
/**
 * 
 * @param {*} conn 
 * @param {*} unique 
 */
function getTable(conn, unique){
    if(!unique) return Promise.reject({ code: 400, errKey: "INVALID_DATA_PROVIDED", msg: "Invalid data provided", data: { unique: "Please provide a unique value!" } })
    // Unique must be a code, uuid or id
    return new Promise((resolve, reject) => {
        // 
        conn.query("SELECT * FROM tables WHERE table_id = ? OR table_uuid = ?", [unique, unique])
            .then(resp => {
                // Empty response
                if(!resp[0][0]) return reject({ code: 404, errKey: "USER_NOT_FOUND", msg: "Table not found", data: { unique } })

                // Resolve table
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
function getTablesQuery(conn, columns, uniques, options = {}){
    return new Promise((resolve, reject) => {
        // SQL Query
        const query = 
            `SELECT 
                ${Array.isArray(columns) ? columns.join(", ") : '*'}
            FROM 
                tables t
            ${options.zoneDetailed != false ? `
            LEFT JOIN
                ( SELECT 
                    zone_id, zone_uuid, zone_name, zone_image
                FROM
                    zones ) z
            ON
                t.zone_id = z.zone_id
            ` : ''}
            ${Array.isArray(uniques) ? `
            WHERE
                t.table_id IN (${Array.from(uniques).fill("?").join(", ")})
            OR
                t.table_uuid IN(${Array.from(uniques).fill("?").join(", ")})` : ''}
            ${options.limit ? `
            LIMIT 
                ${options.limit}` : ''}
            ORDER BY 
                t.table_id DESC`.replace(/\s{2,}|\r\n/g, ' ')

        // Parse uniques
        uniques = Array.isArray(uniques) ? [...uniques, ...uniques] : undefined

        // Query
        conn.query(query, uniques)
            .then(resp => {
                // Parse?
                const results = options.parse ? resp[0].map(row => parseValues(row, { ...options, prefix: 'table_' }) ) : resp[0]
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
