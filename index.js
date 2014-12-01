/*
 * Go Bananas
 *
 * Copyright (c) 2014 Ferry Kobus - Webmonkeys
 */

"use strict";

// globals
global.__root = __dirname + '/';
global.__lib = __dirname + '/lib/';
global.__models = __dirname + '/models/';

// modules
var connect = require('connect'),
	Bananas = require('./lib/bananas'),
	Routes = require('./lib/routes'),
	cookies = require('cookies'),
	serve = require('serve-static'),
	bodyParser = require('body-parser'),
	validator = require('express-validator'),
	session = require('cookie-session');

module.exports = exports = function(opt) {
	var options = opt || {};

	// setup the app
	var app = new Bananas(options);
	
	// routes
	var routes = new Routes(options);

	// create middleware server
	var server = connect()
		// static files
		.use(serve("./", {
			maxAge: 3600000
		}))
		// sessions
		.use(session({
			keys: ['key1']
		}))
		// cookies
		.use(cookies())
		// body parser
		.use(bodyParser.json())
		.use(bodyParser.urlencoded({
			extended: true
		}))
		// validator
		.use(validator())
		// routes
		.use(routes)
		// bananas
		.use(app);

	// return 
	return server;
};