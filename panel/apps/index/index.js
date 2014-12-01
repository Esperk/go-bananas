/*
 * Go Bananas
 *
 * Copyright (c) 2014 Ferry Kobus - Webmonkeys
 */

"use strict";

var __root = global.__root,
	async = require('async'),
	Authentication = require(__root + 'panel/apps/authentication/authentication');

/**
 * Represents Index
 * @constructor
 */
function Index() {
	return function(req, res, callback) {
		// first load authentication
		var auth = new Authentication(),
			authenticated = false;

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
					callback(null, 'Logged in');
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

module.exports = exports = Index;