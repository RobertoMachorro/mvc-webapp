'use strict'

const debug = require('debug')('webapp:service')
const http = require('http')

const core = require('./core')

exports.start = function (applicationRoot, listenPort) {
	debug('port', listenPort)

	const app = core.create(applicationRoot, listenPort)
	const server = http.createServer(app)

	server.on('error', onError)
	server.on('listening', onListening)

	server.listen(listenPort)
}

function onError(error) {
	if (error.syscall !== 'listen') {
		throw error
	}

	const bind = typeof port === 'string'
		? 'Pipe ' + port
		: 'Port ' + port

	switch (error.code) {
		case 'EACCES':
			console.error(bind + ' requires elevated privileges')
			process.exit(1)
			break
		case 'EADDRINUSE':
			console.error(bind + ' is already in use')
			process.exit(1)
			break
		default:
			throw error
	}
}

function onListening() {
	debug('is', this.listening? 'online' : 'offline')
}
