const fs = require('fs')
const path = require('path')
const process = require('process')
const debug = require('debug')('mvc-webapp:core')
const express = require('express')
const session = require('express-session')
const Redis = require('redis')
const logger = require('morgan')
const RedisStore = require("connect-redis").default

exports.create = function (options) {
	debug('application root', options.applicationRoot)

	const app = express()
	app.set('port', options.listenPort)

	// View engine setup
	app.set('views', path.join(options.applicationRoot, 'application/views'))
	app.set('view engine', 'ejs')

	// Engine options
	app.use(logger('common'))
	app.use(express.json())
	app.use(express.urlencoded({extended: false}))
	app.use(express.static(path.join(options.applicationRoot, 'application/public')))
	app.enable('trust proxy')

	// Session Storage
	if (options.sessionRedisUrl) {
		const redisClient = Redis.createClient({
			url: options.sessionRedisUrl,
		})
		const redisStore = new RedisStore({
			client: redisClient,
			prefix: "session:"
		})
		debug('Setting up for Redis session management.')
		app.use(session({
			secret: options.sessionSecret,
			resave: false,
			saveUninitialized: false,
			store: redisStore,
		}))
	}

	// Ensure secure connection in production
	app.use((request, response, next) => {
		if (options.redirectSecure && !request.secure && request.get('x-forwarded-proto') !== 'https' && process.env.NODE_ENV === 'production') {
			return response.redirect('https://' + request.get('host') + request.url)
		}

		next()
	})

	// Cross Origin Resource Sharing
	if (options.allowCORS) {
		app.options('/*', (request, response, _) => {
			response.header('Access-Control-Allow-Origin', '*')
			response.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
			response.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, X-Api-Key')
			response.sendStatus(200)
		})
	}

	// Load controllers into Express middleware
	const controllersPath = path.join(options.applicationRoot, 'application/controllers')
	for (const file of fs.readdirSync(controllersPath)
		.filter(file => path.extname(file) === '.js')) {
		const filepath = path.parse(file)
		const controller = require(path.join(controllersPath, filepath.name))
		const sitepath = '/' + ((filepath.name === 'index') ? '' : filepath.name)
		const subapp = express()
		debug('Loading controller on path:', sitepath)
		app.use(sitepath, controller.actions(subapp))
	}

	// File Not Found
	app.use((request, response, next) => {
		if (options.notfoundMiddleware) {
			options.notfoundMiddleware(request, response, next)
		} else {
			response.status(404).json({
				code: 404,
				message: 'File Not Found'
			})
		}
	})

	// Error handler
	app.use((error, request, response, next) => {
		if (response.headersSent) {
			return next(error)
		}

		if (options.errorMiddleware) {
			options.errorMiddleware(error, request, response, next)
		} else {
			response.status(500).json({
				code: 500,
				message: error
			})
		}
	})

	return app
}
