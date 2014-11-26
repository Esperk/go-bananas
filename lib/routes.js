/*
 * Routes
 *
 * Copyright (c) 2014 Ferry Kobus - Webmonkeys
 */

"use strict";

var url = require('url'),
	qs = require('querystring');

/**
 * Routes Class
 * 
 * @api public
 */
var Routes = function() {};

Routes.params = [];
Routes.route = '';
Routes.method = '';
Routes.data = '';

Routes.parse = function(req) {
	var reqUrl = url.parse(req.url),
		route = reqUrl.pathname,
		body = '',
		self = this;

	req.on('data', function (data) {
		body += data;
		// Too much POST data, kill the connection!
		if (body.length > 1e6) {
			req.connection.destroy();
		}
	});
	req.on('end', function () {
		self.data = qs.parse(body);
	});

	if (route.length) {
		if (route[route.length-1] === '/') {
			route = route.slice(0, -1);
		}
		if (route.length && route[0] === '/') {
			route = route.slice(1);
		}
		this.route = route;
		this.params = route.split('/');
		this.method = req.method;
	}
};

module.exports = exports = Routes;