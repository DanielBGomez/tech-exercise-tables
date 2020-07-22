// Modules
const crypto = require('crypto')
const sha512 = require('js-sha512')
const uuidv4 = require('uuid').v4
const express = require('express')
const jwt = require('jsonwebtoken')

// Local modules
const Validate = require('../Validate')

// Router
const router = express.Router()

// Routes
// Get user data
router.get('/user/:code', (req, res) => {
    // Get conn
    req.db.getConnection()
        .then(conn => {
            // Get user data
            getUser(conn, req.params.code)
                .then(resp => res.send( parseUserValues(resp) ))
                .catch(err => res.status((err || {}).code || 500).send(err))
                .finally(() => conn.release()) // Release pool connection
        })
        .catch(err => DB_CONN_ERROR(res, err))
})

// Create new user
router.post('/user', (req, res) => {
    // Get connection
    req.db.getConnection()
        .then(conn => {
            // Create user
            createUser(conn, req.body)
                .then(resp => {
                    req.log(`User created with id: ${resp.insertId}`, resp)

                    // Get user's data
                    getUser(conn, resp.insertId)
                        .then(resp => res.send( parseUserValues(resp) ))
                        .catch(err => res.status((err || {}).code || 500).send(err))
                })
                .catch(err => {
                    req.log(`Error creating user`, err)
                    res.status((err || {}).code || 500).send(err)
                })
                // Release pool connection
                .finally(() => conn.release())
        })
        .catch(err => DB_CONN_ERROR(res, err))
})
// Auth user
router.post('/user/auth', (req, res) => {
    // Get connection
    req.db.getConnection()
        .then(conn => {
            // Auth user
            authUser(conn, req.body.code, req.body.pin)
                .then(resp => res.send({ token: resp }))
                .catch(err => res.status((err || {}).code || 500).send(err))
                .finally(() => conn.release()) // Release pool connection
        })
        .catch(err => DB_CONN_ERROR(res, err))

})

// Funcions
function DB_CONN_ERROR(res, err){
    return res.status(500).send({ code: 500, errKey: "DB_CONN_ERROR", msg: "Error getting a connection from the db!", data: err })
}
function parseUserValues(userData = {}){
    const result = {}

    // Parse values
    Object.keys(userData).forEach(column => {
        // Remove prefixes
        const key = column.replace('user_', '')
        
        // Ignore protected values
        if(['id', 'password', 'salt'].includes(key)) return;

        // Store @ result
        result[key] = userData[column]
    })

    // Return resulting obj
    return result
}
/**
 * Create new user.
 * 
 * @param {object} conn                 Database pool connection
 * @param {object} userData             User's data
 * @param {number} userData.code        User's Code (alternative ID)
 * @param {string} [userData.uuid]      User's UUID (optional)
 * @param {string} userData.name        User's full name
 * @param {string} userData.image       User's image url
 * @param {string} userData.password    User's password, hashed with SHA512 algorithm
 * @returns {Promise<object>}
 *  
 */
function createUser(conn, userData = {}){
    return new Promise((resolve, reject) => {
        // Destruct params
        const { code, uuid = uuidv4(), name, image, password } = userData

        // Validate params
        const errors = {}

        try {
            Validate.string(code, { label: "Code", regexp: /^\d{4}$/ })
        } catch(err) { errors.code = err }
        try {
            Validate.uuid(uuid, { label: "UUID" })
        } catch(err) { errors.uuid = err }
        try {
            Validate.string(name, { label: "Name", length: { min: 1, max: 255 } })
        } catch(err) { errors.name = err }
        try {
            Validate.image(image)
        } catch(err) { errors.image = err }
        try {
            Validate.password(password, { label: "Password" })
        } catch(err) { errors.password = err }

        // Reject if has errors
        if(Object.keys(errors).length) return reject({ code: 400, errKey: "INVALID_DATA_PROVIDED", msg: "Invalid data provided", data: errors })

        // Parse password
        const saltedPassword = parsePassword(password)

        // Execute query
        conn.execute(`INSERT INTO users
                        (user_code, user_uuid, user_name, user_image, user_password, user_salt)
                    VALUES
                        (?, ?, ?, ?, ?, ?)`, [code, uuid, name, image, saltedPassword.password, saltedPassword.salt])
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
function getUser(conn, unique){
    if(!unique) return Promise.reject({ code: 400, errKey: "INVALID_DATA_PROVIDED", msg: "Invalid data provided", data: { unique: "Please provide a unique value!" } })
    // Unique must be a code, uuid or id
    return new Promise((resolve, reject) => {
        // 
        conn.query("SELECT * FROM users WHERE user_id = ? OR user_code = ? OR user_uuid = ?", [unique, unique, unique])
            .then(resp => {
                // Empty response
                if(!resp[0][0]) return reject({ code: 404, errKey: "USER_NOT_FOUND", msg: "User not found", data: { unique } })

                // Resolve user
                resolve(resp[0][0])
            })
            .catch(reject)
    })
}
function authUser(conn, code, password){
    return new Promise((resolve, reject) => {
        // Validate params
        const errors = {}

        try {
            Validate.string(code, { label: "Code", regexp: /^\d{4}$/ })
        } catch(err) { errors.code = err }
        try {
            Validate.password(password)
        } catch(err) { errors.password = err }

        // Reject if has errors
        if(Object.keys(errors).length) return reject({ code: 400, errKey: "INVALID_DATA_PROVIDED", msg: "Invalid data provided", data: errors })

        // Get user's data
        getUser(conn, code)
            .then(userData => {
                // Validate password
                if(!validatePassword(password, userData.user_salt, userData.user_password)) return reject({ code: 401, errKey: "INVALID_PASSWORD", msg: "Invalid password", data: {} })

                // Generate token -- We are not using a secret key or aditional security params because of this being just a test project.
                jwt.sign( parseUserValues(userData), 'some_key', (err, token) => resolve(token)) 
            })
            .catch(reject)
    })
}
/**
 * 
 * @param {*} password 
 * @param {*} salt 
 * @param {*} saltedPassword 
 */
function validatePassword(password, salt, saltedPassword){
    return (parsePassword(password, salt).password == saltedPassword)
}
/**
 * Parse password with a salt.
 * 
 * @param {string} password     Password to be parsed. This can be a raw password or a hashed one.
 * @param {string} salt         Salt to be used by the parser.
 * 
 * @returns {object}
 */
function parsePassword(password, salt = sha512( crypto.randomBytes(256).toString('base64') )){
    if(!password) throw "Please provide a password"

    try {
        // Check if the password is a valid hash str
        Validate.password(password)
    } catch {
        // Hash password
        password = sha512(password)
    }

    // Return salted password + salt
    return {
        password: sha512( password + salt ),
        salt
    }
}

// Export router
module.exports = router

module.exports.parsePassword = parsePassword
module.exports.validatePassword = validatePassword
