'use strict'

const debug = require('debug')('webapp:core')
const express = require('express')
const session = require('express-session')
const redis = require('redis')
const logger = require('morgan')
const createError = require('http-errors')
const fs = require('fs')
const path = require('path')

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
			url: options.sessionRedisUrl
		})
		app.enable('trust proxy')
		debug('Setting up for Redis session management.')
		app.use(session({
			secret: options.sessionSecret,
			resave: false,
			saveUninitialized: false,
			store: new RedisStore({client})
		}))
	} else {
		const MemoryStore = require('memorystore')(session)
		debug('Setting up for Memory session management.')
		app.use(session({
			secret: options.sessionSecret,
			resave: false,
			saveUninitialized: false,
			store: new MemoryStore({
				ttl: 600000, // TTL with 10m
				checkPeriod: 3600000 // Prune expired entries every 1h
			})
		}))
	}

	// Check for Session Storage
	app.use((req, res, next) => {
		if (!req.session) {
			throw new Error('No session handler found.')
		}

		next()
	})

	// Ensure secure connection in production
	app.use((req, res, next) => {
		if (!req.secure && req.get('x-forwarded-proto') !== 'https' && process.env.NODE_ENV === 'production') {
			return res.redirect('https://' + req.get('host') + req.url)
		}

		next()
	})

	// Cross Origin Resource Sharing
	app.options('/*', (req, res, _) => {
		res.header('Access-Control-Allow-Origin', '*')
		res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
		res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With')
		res.send(200)
	})

	// Load controllers into Express middleware
	const controllersPath = path.join(options.applicationRoot, 'application/controllers')
	fs.readdirSync(controllersPath)
		.filter(file => path.extname(file) === '.js')
		.forEach(file => {
			const filepath = path.parse(file)
			const controller = require(path.join(controllersPath, filepath.name))
			const sitepath = '/' + ((filepath.name === 'index') ? '' : filepath.name)
			debug('Loading controller on path:', sitepath)
			app.use(sitepath, controller)
		})

	// Catch 404 and forward to error handler
	app.use((req, res, next) => {
		next(createError(404, 'Not Found'))
	})

	// Error handler
	app.use((err, req, res, next) => {
		if (res.headersSent) {
			return next(err)
		}

		res.status(err.status || 500)
		if (options.errorMiddleware) {
			options.errorMiddleware(err, req, res, next)
		} else {
			res.json({
				title: 'Default Error Handler',
				status: err.status,
				message: err.message,
				stack: req.app.get('env') === 'development' ? err.stack : ''
			})
		}
	})

	return app
}
