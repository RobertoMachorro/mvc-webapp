![GitHub](https://img.shields.io/github/license/RobertoMachorro/mvc-webapp)
![GitHub release (latest by date)](https://img.shields.io/github/v/release/RobertoMachorro/mvc-webapp)
![build](https://github.com/RobertoMachorro/mvc-webapp/workflows/build/badge.svg)

# mvc-webapp node module

A simple framework for MVC web applications and RESTful APIs.

## Features

* Docker container ready
* Express 5 based HTTP handling and routes
* Familiar MVC folder structure and URL paths (controller per file, public folder for static content, etc)
* Optional shared session management using Redis
* CORS support (HTTP OPTIONS)
* Flexible logging formatting using Morgan (defaults to Apache style)
* Out of the box support for EJS templates in Views, and partials
* Use any Node based data access module for storage
* Custom error handling
* Tiny and clean; outside of NPM dependencies, the code is about ~200 lines

## Setup and First Webapp

1. Follow these steps to get started with your first mvc-webapp:

```bash
mkdir test-app
cd test-app
npm init
npm install express@5 --save
npm install mvc-webapp --save
mkdir -p application/models
mkdir -p application/controllers
mkdir -p application/views
mkdir -p application/adapters
mkdir -p application/public
```

At some point this will be automated by a script, for now, it will involve some keystrokes.

2. Add an entry point app.js on the root folder. This contains your app options and can be configurable via env-vars for container usage:

```javascript
#!/usr/bin/env node

const webapp = require('mvc-webapp')

webapp.run({
	applicationRoot: process.env.PWD,
	listenPort: process.env.PORT || '3000',
	sessionRedisUrl: process.env.REDISCLOUD_URL || undefined,
	sessionSecret: process.env.SESSION_SECRET || undefined,
	redirectSecure: true,
	allowCORS: false,
	viewEngine: 'ejs', // Optional: Pug, Handlebars, EJS, etc
	loggerFormat: 'common', // Morgan formats
	trustProxy: true,
	notfoundMiddleware: (request, response, next) => {
		response.status(404).json({
			code: 404,
			message: 'Sorry! File Not Found'
		})
	},
	errorMiddleware: (error, request, response, _) => {
		response.status(500).json({
			code: 500,
			message: error
		})
	},
})
```

This is the minimal amount of options you can give, sensible and secure default values are given for everything else:

```javascript
#!/usr/bin/env node

const webapp = require('mvc-webapp')

webapp.run({
	// Mandatory
	applicationRoot: process.env.PWD,
	listenPort: process.env.PORT || '3000',

	// Optional Redis Session Management
	// sessionRedisUrl: undefined,
	// sessionSecret: undefined,

	// Optional Security Related
	// redirectSecure: false,
	// allowCORS: false,
	// trustProxy: false,

	// Optional Framework
	// viewEngine: undefined, // Pug, Handlebars, EJS, etc
	// loggerFormat: 'common', // Morgan formats

	// Optional Error Handling
	// notfoundMiddleware: undefined,
	// errorMiddleware: undefined,
})
```

The error handling can be customized to return plain JSON, HTTP codes or an EJS rendered page, your choice.

3. Add an initial controller, this will be automatically mapped to a path (login.js becomes /login/<method>/<params>):

```javascript
exports.actions = controller => {
	controller.get('/', (request, response, _) => {
		response.json({
			status: 'Sample status...',
			data: null,
		})
	})
	
	controller.get('/async', async (request, response) => {
		const hi = await Promise.resolve('Hi!')
		response.send(hi)
	})

	controller.get('/fail', async (request, response) => {
		await Promise.reject('REJECTED!')
	})

	controller.get('/denied', async (request, response) => {
		response.status(403).send('Not here')
	})

	return controller
}
```

This should be familiar to any Express user. A special exception is made for the index.js controller file, this is mapped to the root / folder. Additionally, any routes inside that controller, get appended as a method.

In order to render a view, invoke the view (file)name in the res.render call:

```javascript
response.render('index', {
	title: 'Homepage',
	user: 'octopie'
})
```

4. Run using **npm start** or **node app.js** - added the env var _DEBUG="mvc-webapp:*"_ to see what the framework is doing behind the scenes.

## Docker Support

Add the following file to the root folder and _docker build_:

```Dockerfile
FROM node:latest

WORKDIR /app
ADD . /app

RUN npm install

CMD ["npm","start"]
```

## Also Checkout

1. [EJS Templates](https://ejs.co) - this is what the views use
2. [Express](https://expressjs.com) - this is what powers the HTTP communication
