/*
 * Languages
 *
 * Copyright (c) 2014 Ferry Kobus - Webmonkeys
 */

"use strict";

var __root = global.__root,
	__models = global.__models,
	async = require('async'),
	fs = require('fs'),
	path = require('path'),
	colors = require('colors'),
	Language = require(__models + 'language.js'),
	Translation = require(__models + 'translation.js');

/**
 * Represents Languages
 * @constructor
 */
var Languages = function() {};

/** local variable for the selected language */
Languages.language = null;


/**
 * init
 *
 * @param {function} callback - The callback function
 */
Languages.init = function(callback) {
	var translations = [__root + 'panel/translations/', __root + 'public/translations'],
		self = this;

	async.waterfall([
		function(callback) {
			var directories = [];
			// read array of root folders;
			async.each(translations, function(directory, callback) {
				fs.readdir(directory, function(err, files) {
					if (err) {
						callback(err);
					}
					var resolvedFiles = Object.keys(files).map(function (key) {
						return directory + files[key];
					});
					directories = arrayUnique(resolvedFiles.concat(directories, resolvedFiles));
					callback();
				});
			}, function(err) {
				if (err) {
					callback(err);
				} else {
					callback(null, directories);
				}
			});
		},
		function(directories, callback) {
			async.each(directories, function(directory, callback) {
				var languagePack = directory + '/' + 'package.json';
				fs.exists(languagePack, function(exists) {
					if (exists) {
						self.loadPackage(languagePack, callback);
					} else {
						callback();
					}
				});
			}, function(err) {
				if (err) {
					callback(err);
				} else {
					callback();
				}
			});
		}
	],
	function(err, results) {
		if (err) {
			callback(err);
		}
		callback();
	});
};

/**
 * getLanguage
 * @param {string} lang - The language to get
 * @param {string} fields - space seperated string with fields to fetch
 * @param {function} callback - The callback function
 */
Languages.getLanguage = function(lang, fields, callback) {
	if (typeof fields === 'function') {
		callback = fields;
		fields = null;
	}
	Language.findOne({
			language: lang.toUpperCase()
		}, fields, function(err, results) {
			if (err) {
				callback(err);
			}
			callback(null, results);
		});
};

/**
 * loadLanguage
 * @param {object} pack - The language package
 * @param {function} callback - The callback function
 */
Languages.loadPackage = function(pack, callback) {
	var self = this,
		parts = pack.split('/'),
		lang = parts[parts.length-2];

	async.waterfall([
		function(callback) {
			fs.readFile(pack, {
				encoding: 'utf8'
			}, function(err, data) {
				if (err) {
					callback(err);
				}
				var results = JSON.parse(data);
				callback(null, results);
			});
		},
		function(data, callback) {
			self.getLanguage(lang, '_id', function (err, results) {
				if (err) {
					callback(err);
				}
				callback(null, results._id, data);
			});
		},
		function(langId, langPack, callback) {
			async.each(Object.keys(langPack), function (key, callback) {
				self.validateTranslation(lang, langId, key, langPack[key], callback);
			}, function(err) {
				if (err) {
					callback(err);
				}
				callback();
			});
		}
	],
	function(err, results) {
		if (err) {
			callback(err);
		}
		callback();
	});
};

/**
 * validateTranslation
 * @param {string} lang - The language
 * @param {string} langId - The language._id (mongoose id)
 * @param {string} key - Key of the language package to validate
 * @param {object} pack - The package to validate (file)
 * @param {function} callback - The callback function
 */
Languages.validateTranslation = function(lang, langId, key, pack, callback) {
	var self = this;

	async.waterfall([
		function(callback) {
			self.getTranslation(langId, key, function(err, data) {
				if (err) {
					callback(err);
				}
				if (!data) {
					callback();
				}
				callback(null, data);
			});
		},
		function(data, callback) {
			var values = data.object_values;

			if (!data) {
				var trans = new Translation({
					_language: langId,
					object_key: key,
					object_values: JSON.stringify(pack)
				});
				trans.save(function (err) {
					if (err) {
						callback(err);
					}
					callback(null, ['[', lang.green, ']', '[', key.cyan, ']', 'added'].join(' '));
				});
			} else if (values !== JSON.stringify(pack)) {
				Translation.update({
						_id: data._id
					}, {
						$set: {
							object_values: JSON.stringify(pack)
						}
					}, function(err) {
						if (err) {
							callback(err);
						}
						callback(null, ['[', lang.green, ']', '[', key.cyan, ']', 'updated'].join(' '));
					});
			} else {
				callback();
			}
		}
	],
	function(err, results) {
		if (err) {
			callback(err);
		}
		if (results) {
			process.stdout.write(results + '\n');
		}
		callback();
	});
};

/**
 * getTranslation
 * @param {string} langId - The language._id (mongoose id)
 * @param {string} key - Key of the package to get
 * @param {function} callback - The callback function
 */
Languages.getTranslation = function(langId, key, cb) {
	var self = this;

	async.series([
		function(callback) {
			if (typeof key === 'function') {
				cb = key;
				key = langId;
				self.getCurrentLanguage(function(err, data) {
					if (err) {
						callback(err);
					}
					langId = data._id;
					callback();
				});
			} else {
				callback();
			}
		},
		function(callback) {
			Translation.findOne({
				_language: langId,
				object_key: key
			}, function(err, results) {
				if (err) {
					callback(err);
				}
				if (!results) {
					callback();
				}
				callback(null, results);
			});
		}
	],
	function(err, results) {
		if (err) {
			cb(err);
		}
		cb(null, results[1]);
	});
};

/**
 * setLanguage
 * @param {string} lang - The language
 * @param {function} callback - The callback function
 */
Languages.setLanguage = function(lang, callback) {
	var self = this;

	this.getLanguage(lang, function(err, data) {
		if (err) {
			callback(err);
		}
		self.language = data;
		callback();
	});
};

/**
 * getCurrentLanguage
 * 
 * Get the current language that is set
 *
 * @param {function} callback - The callback function
 */
Languages.getCurrentLanguage = function(callback) {
	if(this.language) {
		callback(null, this.language);
	} else {
		callback('No current language');
	}
};

/**
 * arrayUnique
 * 
 * helper function for creating a unique array
 * 
 * @param {array} array - The array to make unique
 */
function arrayUnique(array) {
	var a = array.concat();
	for (var i = 0; i < a.length; ++i) {
		for (var j= i+1; j < a.length; ++j) {
			if(a[i] === a[j]) {
				a.splice(j--, 1);
			}
		}
	}
	return a;
}

module.exports = exports = Languages;