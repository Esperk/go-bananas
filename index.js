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
	Environment = require('./lib/environment'),
	cookies = require('cookies'),
	bodyParser = require('body-parser'),
	serve = require('serve-static'),
	validator = require('express-validator'),
	session = require('cookie-session');

module.exports = exports = function(opt) {
	var options = opt || {};

	// setup the app
	var app = new Bananas(options);
	
	// routes
	var routes = new Routes(options);

	// environment
	var environment = new Environment(options);

	// create middleware server
	var server = connect()
		// sessions
		.use(session({
			keys: ['key1']
		}))
		// serve static
		// TODO: better ways?
		.use('/public', serve('./public', {maxAge: 3600000}))		
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
		// environment
		.use(environment)
		// bananas
		.use(app);

	// return 
	return server;
};