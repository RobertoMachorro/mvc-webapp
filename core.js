const fs = require('fs')
const path = require('path')
const process = require('process')
const debug = require('debug')('mvc-webapp:core')
const express = require('express')
const session = require('express-session')
const redis = require('redis')
const logger = require('morgan')
const createError = require('http-errors')

exports.create = function (options) {
	debug('application root', options.applicationRoot)

	const app = express()
	app.set('port', options.listenPort)

	// View engine setup
	app.set('views', path.join(options.applicationRoot, 'application/views'))
	app.set('view engine', 'ejs')

	// Engine options
	app.use(logger('dev'))
	app.use(express.json())
	app.use(express.urlencoded({extended: false}))
	app.use(express.static(path.join(options.applicationRoot, 'application/public')))

	// Session Storage
	if (options.sessionRedisUrl) {
		const RedisStore = require('connect-redis')(session)
		const client = redis.createClient({
			url: options.sessionRedisUrl,
		})
		app.enable('trust proxy')
		debug('Setting up for Redis session management.')
		app.use(session({
			secret: options.sessionSecret,
			resave: false,
			saveUninitialized: false,
			store: new RedisStore({client}),
		}))
	} else {
		const MemoryStore = require('memorystore')(session)
		debug('Setting up for Memory session management.')
		app.use(session({
			secret: options.sessionSecret,
			resave: false,
			saveUninitialized: false,
			store: new MemoryStore({
				ttl: 600_000, // TTL with 10m
				checkPeriod: 3_600_000, // Prune expired entries every 1h
			}),
		}))
	}

	// Check for Session Storage
	app.use((request, response, next) => {
		if (!request.session) {
			return next(createError(500, 'No session handler found'))
		}

		next()
	})

	// Ensure secure connection in production
	app.use((request, response, next) => {
		if (!request.secure && request.get('x-forwarded-proto') !== 'https' && process.env.NODE_ENV === 'production') {
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
		debug('Loading controller on path:', sitepath)
		app.use(sitepath, controller)
	}

	// Catch 404 and forward to error handler
	app.use((request, response, next) => {
		next(createError(404, 'Not Found'))
	})

	// Error handler
	app.use((error, request, response, next) => {
		if (response.headersSent) {
			return next(error)
		}

		response.status(error.status || 500)
		if (options.errorMiddleware) {
			options.errorMiddleware(error, request, response, next)
		} else {
			response.json({
				title: 'Default Error Handler',
				status: error.status,
				message: error.message,
				stack: request.app.get('env') === 'development' ? error.stack : '',
			})
		}
	})

	return app
}
