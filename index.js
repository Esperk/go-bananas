/*
 * Go Bananas
 *
 * Copyright (c) 2014 Ferry Kobus - Webmonkeys
 */

"use strict";

var connect = require('connect'),
	Bananas = require('./lib/bananas'),
	session = require('cookie-session');


module.exports = exports = function(options) {
	options = options || {};
	
	// setup the app
	var app = new Bananas(options);

	// create middleware server
	var server = connect()
		.use(session({
			keys: ['key1', 'key2']
		}))
		.use(app);

	// return 
	return server;
};