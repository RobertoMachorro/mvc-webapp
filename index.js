const debug = require('debug')('mvc-webapp:server')
const core = require('./core.js')

exports.run = function (options) {
	validateOptions(options)

	const app = core.create(options)

	debug('port', options.listenPort)
	app.listen(options.listenPort)

	return app
}

exports.test = function (options) {
	validateOptions(options)

	return core.create(options)
}

function validateOptions(options) {
	// Options are enforced as opposed to reasonable defaults
	// This may change in the future

	if (typeof options.applicationRoot === 'undefined') {
		throw new TypeError('Application root must be defined.')
	}

	if (typeof options.listenPort === 'undefined') {
		throw new TypeError('Listening port must be defined.')
	}

	if (typeof options.sessionSecret === 'undefined' &&
		typeof options.sessionRedisUrl !== 'undefined') {
		throw new TypeError('A session secret salt must be defined.')
	}
}
