/*
 * Routes
 *
 * Copyright (c) 2014 Ferry Kobus - Webmonkeys
 */

"use strict";

var url = require('url'),
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
			route = reqUrl.pathname;

		req.routes = [];
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
			req.routes = route.split('/');
		}
		self.loadLanguage(req, res, function() {
			next();
		});
	}
};

Routes.prototype.options = {};

Routes.prototype.loadLanguage = function(req, res, callback) {
	// set the language
	var language = '',
		cookies = new Cookies(req, res),
		redirect = false,
		self = this;
	
	Language.find().distinct('language', function(err, data) {
		if (err) {
			throw new Error(err);
		}
		if (!data) {
			throw new Error('No languages!');
		}
		if (req.routes.length > 0) {
			data.forEach(function(lang) {
				if (~req.routes.indexOf(lang.toLowerCase())) {
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
			var pos = req.routes.indexOf(language);
			if (~pos) {
				req.routes.splice(pos, 1);
				res.writeHead(302, {
					'Location': '/' + req.routes.join('/')
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