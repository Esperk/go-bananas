/*
 * Routes
 *
 * Copyright (c) 2014 Ferry Kobus - Webmonkeys
 */

"use strict";

var __models = global.__models,
	__lib = global.__lib,
	url = require('url'),
	async = require('async'),
	Language = require(__models + 'language'),
	languages = require(__lib + 'languages'),
	Cookies = require('cookies');

/**
 * Represents Routes
 * 
 * @param {object} opt - Options
 */
var Routes = function(opt) {
	var self = this;
	this.options = opt || {};

	return function(req, res, next) {
		var reqUrl = url.parse(req.url),
			route = reqUrl.pathname;

		req.routes = [];
		req.route = '';
		req.xhr = false;
		req.panel = self.cleanPath(self.options.panel.path);

		// parse route
		if (route.length) {
			route = self.cleanPath(route);
			req.route = route;
			req.routes = route.split('/');
		}
		
		if (req.headers['x-requested-with'] !== 'undefined' && req.headers['x-requested-with'] === 'XMLHttpRequest') {
			req.xhr = true;
		}

		self.loadLanguage(req, res, function(err) {
			if (err) {
				throw new Error(err);
			}
			next();
		});
	};
};

/** local storage of the options */
Routes.prototype.options = {};

Routes.prototype.cleanPath = function(path) {
	if (path[path.length-1] === '/') {
		path = path.slice(0, -1);
	}
	if (path.length && path[0] === '/') {
		path = path.slice(1);
	}
	return path;
};

/**
 * loadLanguage
 * @param {object} req
 * @param {object} res
 * @param {function} callback - The callback function
 */
Routes.prototype.loadLanguage = function(req, res, callback) {
	// set the language
	var language = '',
		cookies = new Cookies(req, res),
		self = this;
	
	async.waterfall([
		function(callback) {
			Language.find().distinct('language', function(err, data) {
				if (err) {
					callback(err);
				}
				if (!data) {
					callback('No languages');
				}
				callback(null, data);
			});
		},
		function(languages, callback) {
			self.checkLanguageParam(req, languages, function(err, data) {
				if (err) {
					callback(err);
				}
				if (data) {
					callback(null, data, true);
				} else {
					language = cookies.get('language');
					if (typeof language === 'undefined') {
						if (typeof self.options.language !== 'undefined') {
							language = self.options.language;
						} else {
							language = 'en';
						}
					}
					callback(null, language);
				}
			});
		},
		function(lang, redirect, callback) {
			if(typeof redirect === 'function') {
				callback = redirect;
				redirect = null;
			}
			cookies.set('language', lang);
			if (redirect) {
				var pos;
				if (~(pos = req.routes.indexOf(lang))) {
					req.routes.splice(pos, 1);
					res.writeHead(302, {
						'Location': '/' + req.routes.join('/')
					});
					res.end();
					callback();
				}
			} else {
				languages.setLanguage(lang, function(err) {
					if (err) {
						callback(err);
					}
					callback();
				});
			}
		}
	],
	function(err) {
		if (err) {
			callback(err);
		}
		callback();
	});
};

/**
 * checkLanguageParam
 * @param {object} req
 * @param {array} languages - Array with available languages
 * @param {function} callback - The callback function
 */
Routes.prototype.checkLanguageParam = function(req, languages, callback) {
	for (var i = 0, l = languages.length; i < l; i++) {
		var lang = languages[i];
		if (~req.routes.indexOf(lang.toLowerCase())) {
			callback(null, lang.toLowerCase());
			return;
		}
	}
	callback();
};

module.exports = exports = Routes;