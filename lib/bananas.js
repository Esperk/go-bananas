/*
 * Go Bananas
 *
 * Copyright (c) 2014 Ferry Kobus - Webmonkeys
 */

"use strict";

var routes = require('./routes'),
	languages = require('./languages'),
	mongoose = require('mongoose'),
	fs = require('fs'),
	start_time = null,
	end_time = null;

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
		console.log('Database connected');
		languages.init(function() {
			console.log('Language packages loaded');
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
	var self = this,
		res = {};
	
	start_time = (new Date()).getTime();

	// parse route
	routes.parse(this.req);

	languages.set('en', function() {
		if (routes.params.length > 0) {	
			if (routes.params[0] === 'panel') {
				var Authentication = require(__dirname + '/../panel/apps/authentication/authentication');
				var app = new Authentication();
				app(function(err, result) {
					if(err) throw new Error(err);
					res = result || {};
					self.writeResponse(res, callback);
				});

			// 'normal' pages
			} else {
				console.log('Load a normal page :D');
				res = {
					status: 200, 
					body: 'Todo'
				};
				self.writeResponse(res, callback);
			}

		// serve index
		} else {
			console.log('index');
			res = {
				status: 200, 
				body: 'Todo'
			};
			self.writeResponse(res, callback);
		}
	});
};

Bananas.prototype.writeResponse = function(res, callback) {
	if (!this.res.headersSent) {
		if (typeof res.body !== 'undefined') {
			this.res.setHeader('Content-Type', 'text/html');
			this.res.setHeader('Content-Length', res.body.length);
			this.res.statusCode = res.status || 404;
			this.res.end(res.body);
			end_time = (new Date()).getTime();
			var response_ms = end_time-start_time;
			//console.log('[response took: '+response_ms+' ms]');

		} else if (routes.params[routes.params.length-1].indexOf('.') === -1) {
			var body = 'Not found';
			this.res.setHeader('Content-Type', 'text/html');
			this.res.setHeader('Content-Length', body.length);
			this.res.statusCode = 404;
			this.res.end(body);
		}

	}
	callback();
}

module.exports = exports = Bananas;