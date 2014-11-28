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
global.__jade = {
	basedir: __dirname + '/panel/themes/default/',
	pretty: true
};

// modules
var connect = require('connect'),
	Bananas = require('./lib/bananas'),
	Routes = require('./lib/routes'),
	cookies = require('cookies'),
	serveStatic = require('serve-static'),
	session = require('cookie-session');

module.exports = exports = function(opt) {
	var options = opt || {};

	// setup the app
	var app = new Bananas(options);
	
	// serve static files
	var serve = serveStatic("./", {maxAge: 3600000});

	// routes
	var routes = new Routes(options);

	// create middleware server
	var server = connect()
		// sessions
		.use(session({
			keys: ['key1']
		}))
		// cookies
		.use(cookies())
		// routes
		.use(routes)
		// bananas
		.use(app)
		// static files
		.use(serve);

	// return 
	return server;
};