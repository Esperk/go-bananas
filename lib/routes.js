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
	Cookies = require('cookies');

/**
 * Routes Class
 * 
 * @api public
 */
var Routes = function(opt) {
	var self = this;
	this.options = opt || {};

	return function(req, res, next) {
		var reqUrl = url.parse(req.url),
			route = reqUrl.pathname,
			body = '';

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

		// only set language when a page is requested. Not when files are served.
		if (~req.route.indexOf('.')) {
			next();
		} else {
			self.loadLanguage(req, res, function() {
				next();
			});
		}
	}
};

Routes.prototype.options = {};

Routes.prototype.loadLanguage = function(req, res, callback) {
	// set the language
	var language = '',
		cookies = new Cookies(req, res),
		redirect = false;
	
	Language.find().distinct('language', function(err, data) {
		if (err) {
			throw new Error(err);
		}
		if (!data) {
			throw new Error('No languages!');
		}
		if (req.params.length > 0) {
			data.forEach(function(lang) {
				if (~req.params.indexOf(lang.toLowerCase())) {
					language = lang.toLowerCase();
					redirect = true;
					return;
				}
			});
		}
		if (language === '') {
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
		if (redirect) {
			var pos = req.params.indexOf(language);
			if (~pos) {
				req.params.splice(pos, 1);
				res.writeHead(302, {
					'Location': '/' + req.params.join('/')
				});
				res.end();
			}
		}
		languages.set(language, function(data) {
			callback();
		});
	});
}

module.exports = exports = Routes;