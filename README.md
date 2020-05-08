# mvc-webapp node module

A simple framework for MVC web applications and RESTful APIs.

## Features

* Docker container ready
* Express based HTTP handling and routes
* Familiar MVC folder structure and URL paths (controller per file, public folder for static content, etc)
* Optional shared session management using Redis (falls-back to memorystore)
* CORS support (HTTP OPTIONS)
* Flexible logging formatting using Morgan
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
npm install mvc-webapp --save
mkdir -p application/models
mkdir -p application/controllers
mkdir -p application/views
mkdir -p application/public
```

At some point this will be automated by a script, for now, it will involve some keystrokes.

2. Add an entry point app.js on the root folder. This contains your app options and can be configurable via env-vars for container usage:

```javascript
#!/usr/bin/env node

'use strict'

const webapp = require('mvc-webapp')

webapp.run({
	applicationRoot: process.env.PWD,
	listenPort: process.env.PORT || '3000',
	sessionRedisUrl: process.env.REDISCLOUD_URL || undefined,
	sessionSecret: process.env.SESSION_SECRET || 'NOT_SO_SECRET',
	redirectSecure: true,
	errorMiddleware: (err, req, res, _) => {
		res.json({
			status: err.status,
			message: err.message,
			stack: req.app.get('env') === 'development' ? err.stack : ''
		})
	}
})
```

The error handling can be customized to return plain JSON, HTTP codes or an EJS rendered page, your choice.

3. Add an initial controller, this will be automatically mapped to a path (login.js becomes /login/<method>/<params>):

```javascript
'use strict'

const express = require('express')
const router = new express.Router()

router.get('/', (req, res, _) => {
	res.json({
		status: 'OK',
		data: null
	})
})

module.exports = router
```

This should be familiar to any Express user. A special exception is made for the index.js controller file, this is mapped to the root / folder.

Additionally, any routes inside that controller, get appended as a method. In order to render the EJS view, invoke the view (file)name in the res.render call:

```javascript
res.render('index', {
	title: 'Homepage',
	user: 'octopie'
})
```

4. Run using **npm start** or **node app.js** - added the env var _DEBUG="mvc-webapp:*"_ to see what the framekwork is doing behind the scenes.

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
