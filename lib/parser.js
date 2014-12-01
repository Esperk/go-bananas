/*
 * Go Bananas
 *
 * Copyright (c) 2014 Ferry Kobus - Webmonkeys
 */

"use strict";

var __lib = global.__lib,
	__jadeOptions = global.__jadeOptions,
	fs = require('fs'),
	jade = require('jade'),
	async = require('async'),
	merge = require('utils-merge'),
	languages = require(__lib + 'languages');

/**
 * Represents Parser
 * @constructor
 */
function Parser() {
	// nothing to do here yet
}


/**
 * parse
 * 
 * Parses a file
 * 
 * @param {string} file - The file to parse
 * @param {string} language - Seleted language
 * @param {object} options - Optional object with exta options
 * @param {function} callback	- The callback function
 */
Parser.parse = function() {
	// dynamic arguments
	var file,
		languagePackage,
		options = {},
		callback,
		translation = {};

	for (var i = 0; i < arguments.length; i++) {
		if (i === 0) {
			file = arguments[i];
			continue;
		} else {
			switch (typeof arguments[i]) {
				case 'string':
					languagePackage = arguments[i];
					break;
				case 'function':
					callback = arguments[i];
					break;
				case 'object':
					options = arguments[i];
					break;
			}
		}
	}

	async.series([
		function(callback) {
			fs.exists(file, function (exist) {
				if (!exist) {
					callback('File ' + file + ' doesn\'t exists');
				}
				callback();
			});
		},
		function(callback) {
			if (typeof languagePackage !== 'undefined') {
				languages.getTranslation(languagePackage, function(err, data) {
					if (err) {
						callback(err);
					}
					translation = JSON.parse(data.object_values);
					callback();
				});
			} else {
				callback();
			}
		},
		function(callback) {
			var fn = jade.compileFile(file, __jadeOptions),
				locals = merge({
					language: translation
				}, options),
				html = fn(locals);
			callback(null, html);
		}
	], function(err, results) {
		if (err) {
			callback(err);
		}
		callback(null, results[2]);
	});
};

module.exports = exports = Parser;