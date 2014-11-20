/*
 * Routes
 *
 * Copyright (c) 2014 Ferry Kobus - Webmonkeys
 */

"use strict";

var url = require('url');

/**
 * Routes Class
 * 
 * @api public
 */
var Routes = function() {};

Routes.params = [];

Routes.handle = function(path) {
	var reqUrl = url.parse(path);
	var route = reqUrl.pathname;

	if (route.length) {
		if (route[route.length-1] === '/') {
			route = route.slice(0, -1);
		}
		if (route.length && route[0] === '/') {
			route = route.slice(1);
		}
		this.route = route;
		this.params = route.split('/');
	}
};

module.exports = exports = Routes;