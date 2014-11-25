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

// globals
global.__lib = __dirname + '/';

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
		this.go(next, function(err, out) {
			if(err) throw new Error(err);
			out = out || next;
			out();
		});
	}.bind(this);
}

/**
 * Bananas.go
 * Let's go bananas!
 */
Bananas.prototype.go = function(next, callback) {
	// parse route
	routes.parse(this.req.url);

	var res = {};

	if (routes.params.length > 0) {	
		if (routes.params[0] === 'panel') {
			var Authentication = require(__dirname + '/../panel/apps/authentication/authentication');
			var app = new Authentication();
			app(function(err, result) {
				if(err) throw new Error(err);
				res = result || {};
			});

		// 'normal' pages
		} else {
			console.log('Load a normal page :D');
		}

	// serve index
	} else {
		console.log('index');
	}
	if (typeof res.body !== 'undefined') {
		this.res.writeHead(res.status || 404, {
			'Content-Length': res.body.length,
			'Content-Type': 'text/html'
		});
		this.res.end(res.body);
	} else if (routes.params[routes.params.length-1].indexOf('.') === -1) {
		var body = 'Not found';
		this.res.writeHead(404, {
			'Content-Length': body.length,
			'Content-Type': 'text/html'
		});
		this.res.end(body);
	}
	callback();
};

module.exports = exports = Bananas;