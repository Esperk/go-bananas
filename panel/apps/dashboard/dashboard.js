/*
 * Go Bananas
 *
 * Copyright (c) 2014 Ferry Kobus - Webmonkeys
 */

"use strict";


function Dashboard() {
	return function(req, res, callback) {
		callback(null, 'Logged in');
	}
}


module.exports = exports = Dashboard;