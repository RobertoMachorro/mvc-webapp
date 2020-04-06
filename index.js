'use strict'

const debug = require('debug')('webapp:server')
const http = require('http')

const core = require('./core')

exports.run = function (options) {
	// TODO: Check options

	debug('port', options.listenPort)

	const app = core.create(options)
	const server = http.createServer(app)

	server.on('error', onError)
	server.on('listening', onListening)

	return server.listen(options.listenPort)
}

function onError(error) {
	if (error.syscall !== 'listen') {
		throw error
	}

	const bind = error.address + ':' + error.port

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
