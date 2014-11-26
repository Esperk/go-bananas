/*
 * Routes
 *
 * Copyright (c) 2014 Ferry Kobus - Webmonkeys
 */

"use strict";

var url = require('url'),
	qs = require('querystring'),
	Language = require(__models + 'language'),
	languages = require(__lib + 'languages'),
	Cookies = require('cookies'),
	cookies = null;

/**
 * Routes Class
 * 
 * @api public
 */
var Routes = function(opt) {
	var self = this;
	this.options = opt || {};

	return function(req, res, next) {
		cookies = new Cookies(req, res);
		self.parse(req, function() {
			next();
		});
	}
};

Routes.prototype.options = {};

Routes.prototype.parse = function(req, callback) {
	var reqUrl = url.parse(req.url),
		route = reqUrl.pathname,
		body = '',
		self = this;

	// retrieve post data
	req.on('data', function (data) {
		body += data;
		// Too much POST data, kill the connection!
		if (body.length > 1e6) {
			req.connection.destroy();
		}
	});
	req.on('end', function () {
		req.body = qs.parse(body);
	});

	req.params = [];
	req.route = '';

	// parse route
	if (route.length) {
		if (route[route.length-1] === '/') {
			route = route.slice(0, -1);
		}
		if (route.length && route[0] === '/') {
			route = route.slice(1);
		}
		req.route = route;
		req.params = route.split('/');
	}

	// TODO: only set language when a page is requested. Not when files are served.
	// set the language
	var language = '';
	
	Language.find().distinct('language', function(err, data) {
		if (err) {
			throw new Error(err);
		}
		if (!data) {
			throw new Error('No languages!');
		}
		if(req.params.length > 0) {
			data.forEach(function(lang) {
				if (req.params.indexOf(lang.toLowerCase()) > -1) {
					language = lang.toLowerCase();
					return;
				}
			});
		}
		if(language === '') {
			language = cookies.get('language');
			if (typeof language === 'undefined') {
				if (typeof self.options.language !== 'undefined') {
					language = self.options.language;
				} else {
					language = 'en';
				}
			}
		}
		cookies.set('language', language);
		languages.set(language, function(data) {
			callback();
		});
	});
};

module.exports = exports = Routes;