/*
 * Go Bananas
 *
 * Copyright (c) 2014 Ferry Kobus - Webmonkeys
 */

"use strict";

var __root = global.__root,
	async = require('async'),
	fs = require('fs');

/**
 * Represents Settings
 * @constructor
 */
function Settings() {}


/**
 *
 */
Settings.init = function(callback) {
	async.series([
		function(callback) {
			fs.exists(__root + 'bananas.json', function(exists) {
				if (exists) {
					callback(null);
				} else {
					callback('Settings not found');
				}
			});
		},
		function(callback) {
			fs.readFile(__root + 'bananas.json', function(err, data) {
				if (err) {
					callback(err);
				}
				global.__settings = JSON.parse(data);
				callback();
			});
		}
	], function(err, results) {
		if (err) {
			callback(err);
		}
		callback();
	});
};


module.exports = exports = Settings;