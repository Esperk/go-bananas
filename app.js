/*
 * App
 *
 * Fictional version in real life situations
 * 
 * Copyright (c) 2014 Ferry Kobus - Webmonkeys
 */

"use strict";

var bananas = require('./index.js'),
	http = require('http'),
	options = {
		mode: 'dev',
		language: 'nl',
		jade: {
			use: true,
			pretty: true
		},
		panel: {
			path: '/panel/',
			theme: 'default'
		},
		theme: 'default'
	};

http.createServer(bananas(options)).listen(1337);