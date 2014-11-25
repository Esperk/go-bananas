/*
 * Go Bananas
 *
 * Copyright (c) 2014 Ferry Kobus - Webmonkeys
 */

"use strict";

var routes = require(__lib + 'routes'),
	jade = require('jade');

function Authentication() {
	return function(callback) {
		this.go(function(err, out) {
			callback(err, out);
		});
	}.bind(this);
}

Authentication.prototype.go = function(callback) {
	if (routes.params.length == 1) {
		var options = {
			basedir: __root + 'panel/themes/default/'
		};
		var fn = jade.compileFile(__dirname + '/jade/login.jade', options);
		var body = fn({
			name: "Blaataap"
		});
		callback(null, {
			status: 200,
			body: body
		});
	} else {
		callback();
	}
}

module.exports = exports = Authentication;