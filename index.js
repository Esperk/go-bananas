/*
 * Go Bananas
 *
 * Copyright (c) 2014 Ferry Kobus - Webmonkeys
 */

"use strict";

var connect = require('connect'),
	Bananas = require('./lib/bananas'),
	serveStatic = require('serve-static'),
	session = require('cookie-session');

global.__root = __dirname + '/';

module.exports = exports = function(options) {
	options = options || {};
	
	// setup the app
	var app = new Bananas(options);
	
	var serve = serveStatic("./");

	// create middleware server
	var server = connect()
		// sessions
		.use(session({
			keys: ['key1', 'key2']
		}))
		// bananas
		.use(app)
		// static files
		.use(serve);

	// return 
	return server;
};