/*
 * Go Bananas
 *
 * Copyright (c) 2014 Ferry Kobus - Webmonkeys
 */

"use strict";

var routes = require(__lib + 'routes'),
	jade = require('jade'),
	mongoose = require('mongoose'),
	languages = require(__lib + 'languages'),
	jade_options = {
		basedir: __root + 'panel/themes/default/'
	};

function Authentication() {
	return function(callback) {
		this.go(function(err, out) {
			callback(err, out);
		});
	}.bind(this);
}

Authentication.prototype.go = function(callback) {
	switch (routes.params[1]) {
		case 'signup':
			if(routes.method === 'POST') {
				console.log(routes.data);
				callback();
			} else {
				this.showSignupForm(function(data) {
					callback(null, {
						status: 200,
						body: data
					});
				});
			}
			break;
		case 'recovery':
			if(routes.method === 'POST') {
				console.log(routes.data);
				callback();
			} else {
				this.showRecoveryForm(function(data) {
					callback(null, {
						status: 200,
						body: data
					});
				});
			}
			break;
		default:
			if(routes.params.length === 1) {
				if(routes.method === 'POST') {
					console.log(routes.data);
					callback();
				} else {
					this.showLoginForm(function(data) {
						callback(null, {
							status: 200,
							body: data
						});
					});
				}
			} else {
				callback();
			}
			break;
	}
};

/**
 *
 */
Authentication.prototype.showLoginForm = function(callback) {

	languages.getTranslation('showLoginForm', function(data) {
		var fn = jade.compileFile(__dirname + '/jade/login.jade', jade_options),
			body = fn(data);
		callback(body);
	});
}

/**
 *
 */
Authentication.prototype.showRecoveryForm = function(callback) {
	
	languages.getTranslation('showRecoveryForm', function(data) {
		var fn = jade.compileFile(__dirname + '/jade/recovery.jade', jade_options),
			body = fn(data);
		callback(body);
	});
}

/**
 *
 */
Authentication.prototype.showSignupForm = function(callback) {
	
	languages.getTranslation('showSignupForm', function(data) {
		var fn = jade.compileFile(__dirname + '/jade/signup.jade', jade_options),
			body = fn(data);
		callback(body);
	});
}

module.exports = exports = Authentication;