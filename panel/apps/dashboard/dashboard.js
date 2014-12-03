/*
 * Go Bananas
 *
 * Copyright (c) 2014 Ferry Kobus - Webmonkeys
 */

"use strict";

var __theme = global.__theme,
	parser = require(__lib + 'parser');

function Dashboard() {
	var self = this;

	return function(req, res, callback) {
		// something with environment?
		// get user?
		// get user settings
		// return rendered dashboard
		self.renderPage({}, callback);
	}
}


/**
 * renderPage
 *
 * Function that parses the given template with the given variables
 * @param {object} settings - Settings of the dashboard
 * @param {object} req
 * @param {object} res
 * @param {function} callback - The callback function
 */
Dashboard.prototype.renderPage = function(settings, callback) {
	parser.parse(__theme + 'apps/dashboard/jade/dashboard.jade', 'dashboard', {
		settings: settings
	}, function(err, data) {
		if (err) {
			callback(err);
		}
		callback(null, data);
	});
};

module.exports = exports = Dashboard;