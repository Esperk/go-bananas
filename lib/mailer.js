/*
* Go Bananas
*
* Copyright (c) 2014 Ferry Kobus - Webmonkeys
*/

"use strict";

var __jadeOptions = global.__jadeOptions,
	__settings = global.__settings,
	__lib = global.__lib,
	path = require('path'),
	async = require('async'),
	emailTemplates = require('email-templates'),
	nodemailer = require('nodemailer'),
	htmlToText = require('nodemailer-html-to-text').htmlToText,
	merge = require('utils-merge'),
	languages = require(__lib + 'languages');

/**
* Represents Mailer
* @constructor
*/
function Mailer() {}

/**
 * renderMail
 * 
 * @param {object} options
 * @param {function} callback
 */
Mailer.renderMail = function(options, callback) {
	var template,
		translation = {};

	async.series([
		function(callback) {
			languages.getTranslation(options.translation, function(err, data) {
				if (err) {
					callback(err);
				}
				if (data && typeof data.object_values !== 'undefined') {
					translation = JSON.parse(data.object_values);
				} else {
					translation = {};
				}
				callback();
			});
		},
		function(callback) {
			emailTemplates(options.templateDirectory, __jadeOptions, function(err, tpl) {
				if (err) {
					callback(err);
				}
				template = tpl;
				callback();
			});
		},
		function(callback) {
			var locals = merge(options.locals, {
				mail: translation
			});
			template(options.template, locals, function(err, html, text) {
				if (err) {
					callback(err);
				}
				callback(null, {
					html: html,
					subject: translation.title
				});
			});
		}
	],
	function(err, results) {
		if (err) {
			callback(err);
		}
		callback(null, results[results.length-1]);
	});
};

/**
 * sendMail
 * 
 * 
 * 
 */
Mailer.sendMail = function(mail, user, callback) {
	// TODO:
	// SETUP GLOBAL Mail options
	var transport = nodemailer.createTransport(__settings.mail);
	
	transport.use('compile', htmlToText());
	
	transport.sendMail({
		from: 'Go Bananas <info@webmonkeys.nl>',
		to: user.email,
		subject: mail.subject,
		html: mail.html
	}, function(err, info) {
		if (err) {
			callback(err);
		} else {
			callback(null, info.response);
		}
	});
};

module.exports = exports = Mailer;