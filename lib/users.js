/*
 * Users
 *
 * Copyright (c) 2014 Ferry Kobus - Webmonkeys
 */

"use strict";

var __models = global.__models,
	User = require(__models + 'user'),
	twinBcrypt = require('twin-bcrypt'),
	async = require('async'),
	crypto = require('crypto');

/**
 * Represents Users
 * @constructor
 */
var Users = function() {};

/**
 * findUser
 *
 * @param {string} username - Username
 * @param {function} callback - The callback function
 */
Users.findUser = function(username, callback) {
	User.findOne({
		name: username
	}, function(err, result) {
		if (err) {
			callback(err);
		}
		if (!result) {
			callback();
		} else {
			callback(null, result);
		}
	});
};

/**
 * findUser
 *
 * @param {string} email - Email address
 * @param {function} callback - The callback function
 */
Users.findUserByEmail = function(email, callback) {
	User.findOne({
		email: email
	}, function(err, result) {
		if (err) {
			callback(err);
		}
		if (!result) {
			callback();
		} else {
			callback(null, result);
		}
	});
};

/**
 * addUser
 *
 * @param {string} username - Username
 * @param {string} password - Password
 * @param {string} email - Email address
 * @param {object} req
 * @param {function} callback - The callback function
 */
Users.addUser = function(username, password, email, ip, callback) {
	var hash,
		user;

	async.series([
		function(callback) {
			twinBcrypt.hash(password, function(hash) {
				hash = hash;
				callback();
			});
		},
		function(callback) {
			var secret = crypto.randomBytes(256),
				user = new User({
					name: username,
					password: hash,
					email: email,
					active: true,
					last_ip: ip,
					secret: secret
				});
			user.save(function(err, data) {
				if (err) {
					callback(err);
				} else {
					callback(null, data);
				}
			});
		}
	], 
	function(err, results) {
		if (err) {
			callback(err);
		} else {
			callback(null, results[1]);
		}
	});
};

module.exports = exports = Users;