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
	merge = require('utils-merge'),
	jade_options = {
		basedir: __root + 'panel/themes/default/'
	};

function Authentication() {
	return function(req, res, callback) {
		var pages = ['signup', 'recovery'];

		// handle post
		if (req.method === 'POST') {
			console.log(res.body);
			callback();
		} else if (typeof req.params !== 'undefined') {
			languages.getTranslation('authentication', function(data) {
				var page = '';
				if(typeof req.params[1] !== 'undefined' && pages.indexOf(req.params[1]) > -1) {
					page = req.params[1];
				} else if(typeof req.params[1] === 'undefined') {
					page = 'sign_in';
				} else {
					callback();
					return;
				}

				var fn = jade.compileFile(__dirname + '/jade/authentication.jade', jade_options),
					locals = merge({
						language: data
					}, {
						page: page
					}),
					body = fn(locals);
				
				callback(null, {
					status: 200,
					body: body
				});
			});
		} else {
			callback();
		}
	}
}

module.exports = exports = Authentication;