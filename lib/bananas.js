/*
 * Go Bananas
 *
 * Copyright (c) 2014 Ferry Kobus - Webmonkeys
 */

"use strict";

var languages = require('./languages'),
	mongoose = require('mongoose'),
	fs = require('fs'),
	start_time, end_time = null;

/**
 * Bananas
 * Class 
 */
function Bananas(options) {
	// load database module
	var db = mongoose.connection,
		self = this;

	// on database connection error
	db.on('error', function(err) {
		throw new Error(err);
	});

	// database connection succesfull
	db.once('open', function() {
		console.log('Database connected');

		// initialise the languages
		languages.init(function() {
			console.log('Language packages loaded');
		});
	});

	// connect to the database
	mongoose.connect('mongodb://localhost/test');

	// middleware bananas :D
	return function(req, res, next) {
		start_time = (new Date()).getTime();

		if (~req.route.indexOf('.')) {
			next();
			return;
		}

		if (req.params.length > 0) {	
			if (req.params[0] === 'panel') {
				var Authentication = require(__root + 'panel/apps/authentication/authentication');
				var app = new Authentication();
				app(req, res, function(err, data) {
					if (err) {
						throw new Error(err);
					}
					if (!data) {
						next();
					} else {
						self.writeResponse(res, data);
					}
				});

			// 'normal' pages
			} else {
				console.log('Load a normal page :D');
				var data = {
					status: 200, 
					body: 'Todo'
				};
				self.writeResponse(res, data);
			}

		// serve index
		} else {
			console.log('index');
			var data = {
				status: 200, 
				body: 'Todo'
			};
			self.writeResponse(res, data);
		}
	}
}


Bananas.prototype.writeResponse = function(res, data) {
	if (!res.headersSent && typeof data !== 'undefined') {
		if (typeof data.body !== 'undefined') {
			res.setHeader('Content-Type', 'text/html');
			res.setHeader('Content-Length', data.body.length);
			res.statusCode = data.status || 404;
			res.end(data.body);
			end_time = (new Date()).getTime();
			var response_ms = end_time-start_time;
			console.log('[response took: '+response_ms+' ms]');
		} else if (res.params[res.params.length-1].indexOf('.') === -1) {
			var body = 'Not found';
			res.setHeader('Content-Type', 'text/html');
			res.setHeader('Content-Length', body.length);
			res.statusCode = 404;
			res.end(body);
		}
	}
}

module.exports = exports = Bananas;