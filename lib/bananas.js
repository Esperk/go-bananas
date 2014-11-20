/*
 * Go Bananas
 *
 * Copyright (c) 2014 Ferry Kobus - Webmonkeys
 */

"use strict";

var routes = require('./routes'),
	url = require('url');

function Bananas(options) {
	return function(req, res, next) {
		this.req = req;
		this.res = res;
		this.go(function(err, out) {
			
			out = out || next;
			out();
		});
	}.bind(this);
}

Bananas.prototype.go = function(callback) {
	routes.handle(this.req.url);
	if (routes.params.length > 0) {
		if (routes.params[0] === 'panel') {

			console.log('Load the fucking panel');
		} else {
			
			console.log('Load a normal page :D');
		}
	}
	this.res.end('Oops');
	callback();
};

module.exports = exports = Bananas;