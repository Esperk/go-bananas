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
		"mode": "dev"
	};

http.createServer(bananas(options)).listen(1337);