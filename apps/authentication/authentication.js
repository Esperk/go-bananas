/**
 * Authentication app
 * Can be cloned to frontend apps
 *
 * Copyright (c) 2014 Ferry Kobus - Webmonkeys
 */

"use strict";

var async = require('async'),
	bcrypt = require('bcrypt'),
	salt = '#&a91279&*(*&T^&*%Th7|22fs7d';

/**
 * Represents Authentication.
 * @constructor
 */
function Authentication() {}

/** This is a local {string} variable to store the command to execute */
Authentication.prototype.command = '';

/** This is a local object to store route functions and endpoints */
Authentication.prototype.routes = {
	login: 'login',
	logout: 'logout',
	signup: 'signup',
	recover: 'recovery'
};

/**
 * request
 * @param {int} depth - The depth to look for endpoints
 * @param {object} req
 * @param {object} res
 * @param {function} callback - The callback function
 */
Authentication.prototype.request = function(depth, req, res, callback) {
	var pos,
		self = this,
		fn = Object.keys(this.routes),
		routes = Object.keys(this.routes).map(function (key) {
			return self.routes[key];
		}),
		param = (function() {
			if (typeof req.routes[depth] !== 'undefined' && ~routes.indexOf(req.routes[depth])) {
				return req.routes[depth];
			} else {
				return 'login';
			}
		})();
	// select the command to run from the given param
	if (~(pos = routes.indexOf(param))) {
		this.command = fn[pos];
		if (typeof this[this.command] === 'function') {
			this[this.command](req, res, callback);
		} else {
			callback('command: ' + command + 'not found');
		}
	} else {
		callback();
	}
};

/**
 * logout
 * resets the session therefore logging out the active user/session
 * @param {object} req
 * @param {object} res
 * @param {function} callback - The callback function
 */
Authentication.prototype.logout = function(req, res, callback) {
	var pos = req.routes.indexOf(this.command);
	req.routes.splice(pos, 1);
	// reset session
	req.session = null;
	// redirect to page
	res.writeHead(302, {
		'Location': '/' + req.routes.join('/')
	});
	res.end();
	callback();
};

/**
 * loggedIn
 *
 * Checks if the current browser instance is logged in or not.
 *
 * @param {object} req
 * @param {function} callback - The callback function
 */
Authentication.prototype.loggedIn = function(req, callback) {
	if (typeof req.session.uid !== 'undefined' && req.session.ustr !== 'undefined') {
		// Load hash from your password DB.
		bcrypt.compare(req.session.uid + salt + req.connection.remoteAddress + req.headers['user-agent'], req.session.ustr, function(err, result) {
			if (err) {
				callback(err);
			} else {
				callback(null, result);
			}
		});
	} else {
		callback(null, false);
	}
};

/**
 * parseXhr
 *
 * Parse ajax calls
 *
 * @param {object} req
 * @param {function} callback - The callback function
 */
Authentication.prototype.parseXhr = function(req, callback) {
	var response = {};
	this.checkPost(req, function(err) {
		if (err) {
			response = {
				success: false,
				translation: 'authentication',
				fields: err
			};
		} else {
			response = {
				success: true
			}
		}
		callback(null, JSON.stringify(response));
	});
};

/**
 * checkPost
 *
 * loops through the post data and checks the given input
 *
 * @param {object} req
 * @param {function} callback - The callback function
 */
Authentication.prototype.checkPost = function(req, callback) {
	for(var key in req.body) {
		switch(key) {
			case 'username':
				req.checkBody(key, 'required').len(4, 20);
				break;
			case 'password':
			case 'confirm_password':
				req.checkBody(key, 'required_len_4_20').len(4, 20);
				break;
			case 'email':
				req.checkBody(key, 'valid_email').isEmail();
				break;
			default:
				break;
		}
	}
	var errors = req.validationErrors(true);
	callback(errors);
};

/**
 * validatePassword
 *
 * validates password
 *
 * @param {object} user
 * @param {string} password
 * @param {function} callback - The callback function
 */
Authentication.prototype.validatePassword = function(user, password, callback) {
	bcrypt.compare(password, user.password, function(err, equal) {
		if (err) {
			callback(err);
		} else if (equal) {
			callback();
		} else {
			callback({
				combination: {
					msg: 'validation_failed'
				}
			});
		}
	});
};

/**
 * setSession
 *
 * creates a session so only signin once ;)
 *
 * @param {object} user
 * @param {object} req
 * @param {function} callback - The callback function
 */
Authentication.prototype.setSession = function(user, req, callback) {
	bcrypt.hash(user._id + salt + req.connection.remoteAddress + req.headers['user-agent'], 10, function(err, hash) {
		req.session.uid = user._id;
		req.session.ustr = hash;
		callback();
	});
};

module.exports = exports = Authentication;
