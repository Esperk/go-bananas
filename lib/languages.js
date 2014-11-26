/*
 * Languages
 *
 * Copyright (c) 2014 Ferry Kobus - Webmonkeys
 */

"use strict";

var Language = require(__models + 'language.js'),
	Translation = require(__models + 'translation.js');

/**
 * Languages Class
 * 
 * @api public
 */
var Languages = function() {};
Languages.language = {};

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

Languages.addTranslation = function(key, values, lang) {
	var lang = lang;
	if (typeof lang === 'undefined') {
		lang = this.language;
		addTranslation();
	} else {
		this.get(lang, function(data) {
			lang = data;
			addTranslation();
		});
	}
	function addTranslation() {
		var trans = new Translation({
			_language: lang._id,
			object_key: key,
			object_values: JSON.stringify(values)
		});
		trans.save(function (err) {
			if(err) throw new Error(err);
		});	
	}
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

	/*
	Translation.remove({object_key: 'showRecoveryForm'}, function(err) {
		if(err) throw new Error(err);
	});
	*/
	
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