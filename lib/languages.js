/*
 * Languages
 *
 * Copyright (c) 2014 Ferry Kobus - Webmonkeys
 */

"use strict";

var fs = require('fs'),
	Language = require(__models + 'language.js'),
	Translation = require(__models + 'translation.js');

/**
 * Languages Class
 * 
 * @api public
 */
var Languages = function() {};
Languages.language = {};

Languages.init = function(callback) {
	var translationFolders = [__root + 'panel/translations/'],
		folders = [],
		self = this;
	
	for (var i=0,l=translationFolders.length;i<l;i++) {
		var rootFolder = translationFolders[i],
			scanFolders = fs.readdirSync(rootFolder);
			scanFolders.forEach(function(file) {
				if(fs.statSync(rootFolder + file).isDirectory()) {
					folders.push(rootFolder + file + '/');
				}
			});
	}
	if (folders.length > 0) {
		folders.forEach(function(folder) {
			var languagePack = folder + 'package.json';
			if (fs.existsSync(languagePack)) {
				var parts = folder.split('/'),
					languagePackage = JSON.parse(fs.readFileSync(languagePack, 'utf8'));

				self.get(parts[parts.length-2], function(lang) {

					for (var key in languagePackage) {
						Translation.findOne({_language: lang._id, object_key: key}, function(err, results) {
							if (err) throw new Error(err);

							if (!results) {
								var trans = new Translation({
									_language: lang._id,
									object_key: key,
									object_values: JSON.stringify(languagePackage[key])
								});
								trans.save(function (err) {
									if(err) throw new Error(err);
								});
							} else if (results.object_values !== JSON.stringify(languagePackage[results.object_key])) {
								Translation.update({ _id: results._id }, { $set: { object_values: JSON.stringify(languagePackage[results.object_key]) }}, function() {
									//
								});
							}
						});
					}
				});
			}
		});
	}
	callback();
}

Languages.get = function(lang, callback) {
	Language
		.findOne({
			language: lang.toUpperCase()
		})
		.exec(function (err, data) {
			if (err) throw new Error(err);
			callback(data);
		});
};

Languages.set = function(lang, callback) {
	var self = this;
	this.get(lang, function(data) {
		self.language = data;
		callback();
	});
}

Languages.add = function(lang, label) {
	var language = new Language({
		language: lang.toUpperCase(),
  	label: label,
  	icon: lang.toLowerCase()+'.png'
	});

	language.save(function (err) {
		if (err) throw new Error(err);
	});
};

Languages.getTranslation = function(key, callback, lang) {
	var lang = lang;
	if (typeof lang === 'undefined') {
		lang = this.language;
		getTranslation();
	} else {
		this.get(lang, function(data) {
			lang = data;
			getTranslation();
		});
	}
	
	function getTranslation() {
		Translation
			.findOne({
				_language: lang._id,
				object_key: key
			})
			.exec(function (err, trans) {
				if (err) throw new Error(err);
				var data = JSON.parse(trans.object_values);
				callback(data);
			});
		}
};

module.exports = exports = Languages;