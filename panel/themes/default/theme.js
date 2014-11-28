/*
 * Go Bananas
 *
 * Copyright (c) 2014 Ferry Kobus - Webmonkeys
 */

"use strict";


/*
 * theme should return object of files.
 * @return {navigation: {tree: {}}}
 * snapte ;)
 */

function Theme() {
	return function(req, res, callback) {
		callback();
	}
}

Theme.prototype.navigation = function() {
	return {};
};

module.exports = exports = Theme;