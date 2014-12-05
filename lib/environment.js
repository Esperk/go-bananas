/*
 * Environment
 *
 * Copyright (c) 2014 Ferry Kobus - Webmonkeys
 */

"use strict";

var __root = global.__root,
	merge = require('utils-merge'),
	options = {
		jade: {
			use: true,
			pretty: true
		},
		panel: {
			path: '/panel/',
			theme: 'default'
		},
		theme: 'default'
	};

/**
 * Represents Environment
 * 
 * @param {object} opt - Options
 */
var Environment = function(opt) {
	var options = merge(opt, options);

	return function(req, res, next) {
		var theme = '',
			panelRoute = req.panel.split('/'),
			reqRoute = req.routes.slice(0, panelRoute.length);

		// setup panel environment
		if (req.routes.length > 0 && arraysEqual(panelRoute, reqRoute)) {
			theme = __root + 'panel/themes/' + options.panel.theme + '/';
			global.__jadeOptions = {
				basedir: theme,
				pretty: options.jade.pretty
			};
			global.__theme = theme;
			global.__panel = true;

		// setup normal environment
		} else {
			theme = __root + 'public/themes/' + options.theme + '/';
			global.__jadeOptions = {
				basedir: theme,
				pretty: options.jade.pretty
			};
			global.__theme = theme;
			global.__panel = false;
		}
		next();
	};
};


/**
 * arraysEqual
 * 
 * @param {array} a - First array
 * @param {array} b = Second array
 */
function arraysEqual(a, b) {
	var i = a.length;
	if (i !== b.length) {
		return false;
	}
	while (i--) {
		if (a[i] !== b[i]) {
			return false;
		}
	}
	return true;
}

module.exports = exports = Environment;