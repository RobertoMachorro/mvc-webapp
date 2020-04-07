'use strict'

const debug = require('debug')('webapp:server')
const http = require('http')

const core = require('./core')

exports.run = function (options) {
	validateOptions(options)

	const app = core.create(options)
	const server = http.createServer(app)

	server.on('error', onError)
	server.on('listening', onListening)

	debug('port', options.listenPort)
	return server.listen(options.listenPort)
}

function validateOptions(options) {
	if (typeof options.applicationRoot === 'undefined') {
		throw new TypeError('Application root must be defined.')
	}

	if (typeof options.listenPort === 'undefined') {
		throw new TypeError('Listening port must be defined.')
	}

	if (typeof options.sessionSecret === 'undefined') {
		throw new TypeError('A session secret salt must be defined.')
	}
}

function onError(error) {
	if (error.syscall !== 'listen') {
		throw error
	}

	const bind = error.address + ':' + error.port

	switch (error.code) {
		case 'EACCES':
			throw new Error(bind + ' requires elevated privileges')
		case 'EADDRINUSE':
			throw new Error(bind + ' is already in use')
		default:
			throw error
	}
}

function onListening() {
	debug('is', this.listening ? 'online' : 'offline')
}
