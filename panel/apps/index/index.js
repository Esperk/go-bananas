/*
 * Go Bananas
 *
 * Copyright (c) 2014 Ferry Kobus - Webmonkeys
 */

"use strict";

var __root = global.__root,
	async = require('async'),
	path = require('path'),
	fs = require('fs'),
	Authentication = require(__root + 'panel/apps/authentication/authentication');

/**
 * Represents Index
 * @constructor
 */
function Index() {
	var self = this;

	return function(req, res, callback) {
		// first load authentication
		var auth = new Authentication(),
			authenticated = false,
			app;

		async.series([
			function(callback) {
				// returns true if loggedin or page from auth app.
				auth(req, res, function(err, data) {
					if (err) {
						callback(err);
					}
					if (typeof data === 'boolean') {
						authenticated = data;
					}
					callback(null, data);
				});
			},
			function(callback) {
				if (authenticated) {
					self.load(req, res, function(err, application) {
						if (err) {
							callback(err);
						}
						if (typeof application === 'string') {
							callback(null, application);
						} else {
							app = application;
							callback();
						}
					});
				} else {
					callback();
				}
			},
			function(callback) {
				if (authenticated && app) {
					app(req, res, function(err, data) {
						if (err) {
							callback(err);
						}
						if (!data) {
							callback(null, 'No data received!');
						} else {
							callback(null, data);
						}
					});
				} else {
					callback();
				}
			}
		],
		function(err, results) {
			if (err) {
				callback(err);
			}
			var index = 0,
				length = results.length,
				data = results[index];

			// loop through the results to find the response
			while (typeof data !== 'string') {
				if (index < length) {
					index++;
					data = results[index];
					continue;
				}
				break;
			}

			if (typeof data === 'string') {
				callback(null, data);
			} else {
				callback();
			}
		});
	}
}

/**
 * load
 *
 * @param {object} req
 * @param {object} res
 * @param {function} callback
 */
Index.prototype.load = function(req, res, callback) {
	var route = arrayDiff(req.routes, req.panel.split('/')),
		app = 'dashboard',
		directory = __root + 'panel/apps/',
		appFile = '';

	if (route.length > 0) {
		app = route[0];
	}

	appFile = path.normalize(directory + app +'/' + app + '.js');
	
	fs.exists(appFile, function(exists) {
		if (!exists) {
			callback(null, app + ' not found!');
		} else {
			var Application = require(appFile);
			callback(null, new Application());
		}
	});
};

/**
 * arrayDiff
 * helper function
 */
function arrayDiff(a, b) {
	return a.filter(function(i) {
		return !~b.indexOf(i);
	});
}

module.exports = exports = Index;