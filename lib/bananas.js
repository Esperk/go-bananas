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

// output var
Bananas.prototype.html = '';

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
		// reset html buffer
		self.html = '';

		// debug for response time
		start_time = (new Date()).getTime();

		if (~req.route.indexOf('.')) {
			next();
			return;
		}

		if (req.routes.length > 0) {	
			if (req.routes[0] === 'panel') {
				var app = self.load('authentication');
				app(req, res, function(err, data) {
					if (err) {
						throw new Error(err);
					}
					if (!data) {
						next();
					} else if (data.loggedIn) {
						// load dashboard?
						self.go(res, req, next);
					} else {
						self.html += data;
						self.writeResponse(res);
					}
				});

			// 'normal' pages
			} else {
				console.log('Load a normal page :D');
				self.html += 'Todo';
				self.writeResponse(res);
			}

		// serve index
		} else {
			console.log('index');
			self.html += 'Todo';
			self.writeResponse(res);
		}
	}
}

/**
 * go
 *
 * Go bananas!
 */
Bananas.prototype.go = function(res, req, next) {
	var app = 'dashboard',
		self = this;

	if (typeof req.routes[1] !== 'undefined') {
		app = req.routes[1];
	}

	var theme = require(__root + 'panel/themes/default/theme.js');

	if (fs.existsSync(__root + 'panel/apps/' + app + '/' + app + '.js')) {
		var App = this.load(app);
		App(req, res, function(err, data) {
			if (err) {
				throw new Error(err);
			}
			if (!data) {
				next();
			}
			self.html += data;
			self.writeResponse(res);
		});
	} else {
		next();
	}
}

/**
 * Load an app
 */
Bananas.prototype.load = function(app) {
	var appToLoad = app.toLowerCase();
	var App = require(__root + 'panel/apps/' + appToLoad + '/' + appToLoad);
	return new App();
}

/**
 * Create the response
 */
Bananas.prototype.writeResponse = function(res) {
	if (!res.headersSent) {
		if (this.html.length > 0) {
			res.setHeader('Content-Type', 'text/html');
			res.setHeader('Content-Length', this.html.length);
			res.statusCode = 200;
			res.end(this.html);
			end_time = (new Date()).getTime();
			var response_ms = end_time-start_time;
			console.log('[response took: '+response_ms+' ms]');
		}
	}
}

module.exports = exports = Bananas;