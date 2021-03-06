/*
 * Go Bananas
 *
 * Copyright (c) 2014 Ferry Kobus - Webmonkeys
 */

"use strict";

var __root = global.__root,
	async = require('async'),
	fs = require('fs'),
	merge = require('utils-merge'),
	mongoose = require('mongoose'),
	languages = require('./languages'),
	settings = require('./settings'),
	colors = require('colors'),
	options = {
		language: 'nl'
	},
	start_time, end_time = null;

/** variable for maintaining output for the browser */
Bananas.prototype.output = '';

/**
 * Represents Bananas
 * @constructor
 */
function Bananas(opt) {
	// load database module
	var db = mongoose.connection,
		self = this;

	options = merge(opt, options);

	// on database connection error
	db.on('error', function(err) {
		process.stdout.write(['[', '✗'.red, ']', 'database connection'].join(' ') + '\n');
		throw new Error(err);
	});

	// database connection succesfull
	db.once('open', function() {
		process.stdout.write(['[', '✓'.green, ']', 'database connection'].join(' ') + '\n');

		async.parallel([
			// initialise the language packages
			function(callback) {
				languages.init(function(err) {
					if (err) {
						process.stdout.write(['[', '✗'.red, ']', 'language initialisation'].join(' ') + '\n');
						callback(err);
					}
					process.stdout.write(['[', '✓'.green, ']', 'language initialisation'].join(' ') + '\n');
					callback();
				});
			},
			function(callback) {
				settings.init(function(err) {
					if (err) {
						process.stdout.write(['[', '✗'.red, ']', 'settings initialisation'].join(' ') + '\n');
						callback(err);
					}
					process.stdout.write(['[', '✓'.green, ']', 'settings initialisation'].join(' ') + '\n');
					callback();
				});
			}
		],
		function(err, results) {
			if (err) {
				throw new Error(err);
			}
		});
	});

	// connect to the database
	mongoose.connect('mongodb://localhost/test');

	// middleware bananas
	return function(req, res, next) {
		// reset html buffer
		self.output = '';

		// debug for response time
		start_time = (new Date()).getTime();

		// first filter out direct calls to libraries:
		// TODO



		var index;

		async.series([
			function(callback) {
				var directory = 'public';

				// TODO: dirty hack to disable error in this stage of development
				if (req.route === 'favicon.ico') {
					var body = 'Not found';
					res.writeHead(404, {
						'Content-Length': body.length,
						'Content-Type': 'text/plain'
					});
					res.end(body);
				}

				if (global.__panel) {
					directory = 'panel';
				}
				
				var Index = require(__root + directory + '/apps/index/index');
				index = new Index();
				callback();
			},
			function(callback) {
				index(req, res, callback);
			}],
		function(err, results) {
			if (err) {
				throw new Error(err);
			}
			self.output = results[results.length-1];
			if(typeof self.output === 'string') {
				self.writeResponse(req, res);
			}
			next();
		});
	};
}

/**
 * writeResponse
 * 
 * writes data to the browser
 * @param {object} res
 */
Bananas.prototype.writeResponse = function(req, res) {
	if (!res.headersSent) {
		var contentType = 'text/html';
		if (req.xhr) {
			contentType = 'application/json';
		}

		res.writeHead(200, {
			'Content-Length': this.output.length,
			'Content-Type': contentType
		});
		res.end(this.output);
	}
	end_time = (new Date()).getTime();
	var response_ms = end_time-start_time;
	console.log('[response took: '+response_ms+' ms]');
};

module.exports = exports = Bananas;