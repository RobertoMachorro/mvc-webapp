'use strict'

const path = require('path')
const debug = require('debug')('webapp:core')
const express = require('express')

exports.create = function (applicationRoot, listenPort) {
	debug('application root', applicationRoot)

	const app = express()
	app.set('port', listenPort)

	// View engine setup
	app.set('views', path.join(applicationRoot, 'application/views'))
	app.set('view engine', 'ejs')

	//app.use(logger('dev'))
	app.use(express.json())
	app.use(express.urlencoded({extended: false}))
	app.use(express.static(path.join(applicationRoot, 'application/public')))

	return app
}

/*
const fs = require('fs')
const createError = require('http-errors')
const session = require('express-session')
const redis = require('redis')
const logger = require('morgan')

// Session storage
if (process.env.REDISCLOUD_URL) {
	const RedisStore = require('connect-redis')(session)
	const client = redis.createClient({
		url: process.env.REDISCLOUD_URL
	})
	app.enable('trust proxy')
	debug('Setting up for Redis session management.')
	app.use(session({
		secret: process.env.SESSION_SECRET || 'NOT_SO_SECRET',
		resave: false,
		saveUninitialized: false,
		store: new RedisStore({client})
	}))
} else {
	const MemoryStore = require('memorystore')(session)
	debug('Setting up for Memory session management.')
	app.use(session({
		secret: process.env.SESSION_SECRET || 'NOT_SO_SECRET',
		resave: false,
		saveUninitialized: false,
		store: new MemoryStore({
			ttl: 600000, // TTL with 10m
			checkPeriod: 3600000 // Prune expired entries every 1h
		})
	}))
}

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

// Load controllers into Express
fs.readdirSync('application/controllers')
	.filter(file => path.extname(file) === '.js')
	.forEach(file => {
		const filepath = path.parse(file)
		const controller = require('./application/controllers/' + filepath.name)
		const sitepath = '/' + ((filepath.name === 'index') ? '' : filepath.name)
		app.use(sitepath, controller)
		debug('Loading controller on path:', sitepath)
	})

// Catch 404 and forward to error handler
app.use((req, res, next) => {
	next(createError(404))
})

// Error handler
app.use((err, req, res, next) => {
	if (res.headersSent) {
		return next(err)
	}

	res.status(err.status || 500)
	if (req.xhr) {
		res.json({error: err.message})
	} else {
		res.render('error', {
			title: err.status,
			message: err.message,
			stack: req.app.get('env') === 'development' ? err.stack : ''
		})
	}
})

module.exports = app
*/
