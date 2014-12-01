/**
 * Authentication application
 *
 * Copyright (c) 2014 Ferry Kobus - Webmonkeys
 */

"use strict";

var __root = global.__root,
	__lib = global.__lib,
	__theme = global.__theme,
	async = require('async'),
	util = require('util'),
	User = require(__models + 'user'),
	parser = require(__lib + 'parser'),
	authApp = require(__root + 'apps/authentication/authentication');

/**
 * extend functions from apps/authentication
 * we do this to prevent duplicate code
 * and reusable code in the frontend ;)
 */
util.inherits(Authentication, authApp);

/**
 * Represents the authentication app
 * @constructor
 * @param {int} dpt - Depth to look for endpoints for authentication pages
 */
function Authentication(dpt) {
	var self = this,
		depth = dpt || 1;

	return function(req, res, callback) {
		// reroute logout?
		if (self.routes.logout === req.routes[depth]) {
			self.request(depth, req, res, callback);
		} else {
			self.loggedIn(req, function(loggedIn) {
				if (loggedIn) {
					callback(null, true);
				} else {
					self.request(depth, req, res, callback);
				}
			});
		}
	}
}


/**
 * login
 *
 * loops through the post data and checks the given input
 *
 * @param {object} req
 * @param {function} callback - The callback function
 */
Authentication.prototype.login = function(req, res, callback) {
	var errors = {},
		self = this;

	if (req.xhr) {
		this.parseXhr(req, callback);
	} else if (req.method === 'POST') {
		async.waterfall([
			function(callback) {
				self.checkPost(req, function(errors) {
					if (errors) {
						callback(errors);
					} else {
						callback();
					}
				});
			},
			function(callback) {
				User.findOne({
					name: req.body.username
				}, function(err, result) {
					if (err) {
						callback(err);
					}
					if (!result) {
						callback({
							username: {
								msg: 'username_404'
							}
						});
					} else {
						callback(null, result);
					}
				});
			},
			function(user, callback) {
				self.validatePassword(user, req.body.password, function(err) {
					if (err) {
						callback(err);
					} else {
						callback(null, user);
					}
				});
			},
			function(user, callback) {
				self.setSession(user, req, function() {
					res.writeHead(302, {
						'Location': '/' + req.routes.join('/')
					});
					res.end();
					callback();
				});
			}
		],
		function(err) {
			if (err) {
				if (typeof err === 'object') {
					self.renderPage('sign_in', err, req, res, callback);
				} else {
					callback(err);
				}
			} else {
				callback();
			}
		});
	} else {
		this.renderPage('sign_in', errors, req, res, callback);
	}
};

/**
 * signup
 *
 * Generates signup pages
 *
 * @param {object} req
 * @param {object} res
 * @param {function} callback - The callback function
 */
Authentication.prototype.signup = function(req, res, callback) {
	var errors = {};

	if(req.method === 'POST') {
		console.log('HANDLE POST');
	}
	this.renderPage('signup', errors, req, res, callback);
};

/**
 * recover
 *
 * Generates recover pages
 *
 * @param {object} req
 * @param {object} res
 * @param {function} callback - The callback function
 */
Authentication.prototype.recover = function(req, res, callback) {
	var errors = {};

	if(req.method === 'POST') {
		console.log('HANDLE POST');
	}
	this.renderPage('recovery', errors, req, res, callback);
};

/**
 * renderPage
 *
 * Function that parses the given template with the given variables
 * @param {string} page - Which page to parse
 * @param {object} errors - Object that contains conflicting fields and error messages
 * @param {object} req
 * @param {object} res
 * @param {function} callback - The callback function
 */
Authentication.prototype.renderPage = function(page, errors, req, res, callback) {
	parser.parse(__theme + 'apps/authentication/jade/authentication.jade', 'authentication', {
		page: page,
		errors: errors
	}, function(err, data) {
		if (err) {
			callback(err);
		}
		callback(null, data);
	});
};

module.exports = exports = Authentication;