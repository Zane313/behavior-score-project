const jsonServer = require('json-server')
const data = require('../db.json')

const server = jsonServer.create()
const router = jsonServer.router(JSON.parse(JSON.stringify(data)))

server.use(jsonServer.defaults())
server.use(router)

module.exports = server
