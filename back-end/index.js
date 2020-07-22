// Modules
require('dotenv').config()
const http = require("http")
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const mysql = require('mysql2/promise')

// Local Modules
const Validate = require('./src/Validate')

// Configs
const PORT = process.env.PORT || 3100
const DB_CONFIG = {
    host: 'localhost',
    user: 'root',
    database: 'tech_test',
    waitForConnections: true
}

// Create db pool
const db = mysql.createPool(DB_CONFIG)
const db_middleware = (req, res, next) => {
    // Setup query and execute functions
    req.db = db
    req.log = log
    // Next
    next()
}

// Create app
const app = express()

// Setup middlewares
app.use(cors())
app.use(helmet())
app.use(express.json())
app.use(db_middleware)

// Setup routers
const UsersEndpoint = require('./src/endpoints/user')

app.use(UsersEndpoint)

// Start server
const server = http.createServer(app)

// Start
server.listen(PORT)
log(`Server listening on port ${PORT}`)



// Functions

/**
 * Log any server event
 * 
 * @param {*} msg 
 * @param  {...any} data 
 */
function log(msg, ...data) {
    // Log time
    const time = new Date()
    // Output msg in console
    console.log(`[${time.toISOString()}]`, msg)
    // If data is defined, output in console
    if(data.length) console.log(`[${time.toISOString()}]`, ...data)
}