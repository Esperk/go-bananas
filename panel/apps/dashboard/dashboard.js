/*
 * Go Bananas
 *
 * Copyright (c) 2014 Ferry Kobus - Webmonkeys
 */

"use strict";

var languages = require(__lib + 'languages'),
	jade = require('jade');

function Dashboard() {
	return function(req, res, callback) {

		languages.getTranslation('dashboard', function(data) {
			var fn = jade.compileFile(__dirname + '/jade/dashboard.jade', __jade),
				html = fn({language: data});

			callback(null, html);
		});
	}
}

module.exports = exports = Dashboard;