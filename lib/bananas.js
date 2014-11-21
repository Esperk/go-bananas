/*
 * Go Bananas
 *
 * Copyright (c) 2014 Ferry Kobus - Webmonkeys
 */

"use strict";

var routes = require('./routes'),
	url = require('url'),
	mongoose = require('mongoose'),
	fs = require('fs');

/**
 * Bananas
 * Class 
 */
function Bananas(options) {
	// load database module
	var db = mongoose.connection;

	// on database connection error
	db.on('error', function(err) {
		throw new Error(err);
	});

	// database connection succesfull
	db.once('open', function() {
		console.log('Database connected!');
		// Load schemas and models.
		fs.readdirSync(__dirname + '/../models').forEach(function(filename) {
			if (filename.indexOf('.js')) {
				require(__dirname + '/../models/' + filename);
			}
		});
	});
	// connect to the database
	mongoose.connect('mongodb://localhost/test');

	// middleware bananas :D
	return function(req, res, next) {
		this.req = req;
		this.res = res;
		this.go(function(err, out) {
			// 
			out = out || next;
			out();
		});
	}.bind(this);
}

/**
 * Bananas.go
 * Let's go bananas!
 */
Bananas.prototype.go = function(callback) {
	// parse route
	routes.parse(this.req.url);

	if (routes.params.length > 0) {
		// panel
		if (routes.params[0] === 'panel') {
			console.log('Load the panel');

		// favicon
		} else if (routes.params[0] === 'favicon.ico') {
			var body = 'Not found';
			this.res.writeHead(404, {
				'Content-Length': body.length,
				'Content-Type': 'text/plain'
			});
			this.res.end(body);
		
		// serve static files here ? 
		} else if (routes.params[routes.params.length-1].indexOf('.')) {
			console.log('Serve static file?');

		// 'normal' pages
		} else {
			console.log('Load a normal page :D');
		}

	// serve index
	} else {
		console.log('index');
	}

	this.res.end('Oops');
	callback();
};

module.exports = exports = Bananas;