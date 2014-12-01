/*
 * Go Bananas
 *
 * Copyright (c) 2014 Ferry Kobus - Webmonkeys
 */

"use strict";

var jade = require('jade'),
	assert = require('assert'),
	languages = require(__lib + 'languages'),
	merge = require('utils-merge'),
	User = require(__models + 'user'),
	twinBcrypt = require('twin-bcrypt'),
	crypto = require('crypto'),
	salt = '#&a91279&*(*&T^&*%Th7|22fs7d';

function Authentication() {
	var self = this;

	return function(req, res, callback) {
		var pages = ['signup', 'recovery'];

		// logout, no need to parse the rest
		if (typeof req.routes[1] !== 'undefined' && req.routes[1] === 'logout') {
			self.logout(req, res);
			return;
		}

		if (typeof req.session.uid !== 'undefined' && req.session.ustr !== 'undefined') {
			if (twinBcrypt.compareSync(req.session.uid + salt + req.connection.remoteAddress + req.headers['user-agent'], req.session.ustr)) {
				callback(null, {
					loggedIn: true
				});
				return;
			}
		}

		// handle post
		if (req.method === 'POST') {
			if(typeof req.routes[1] !== 'undefined' && ~pages.indexOf(req.routes[1])) {
				if(req.routes[1] === 'signup') {
					/*
					// validation
					req.assert('username', 'required').notEmpty().gte(5);
					req.assert('email', 'valid email required').notEmpty().isEmail();
					req.assert('password', '6 to 20 characters required').len(6, 20);
					req.assert('confirm_password', '6 to 20 characters required').len(6, 20);
					var errors = req.validationErrors(true);
					if (errors) {
						console.log(errors);
					}
					if(req.body.password !== req.body.confirm_password) {

					}
					*/
					// signup
					var hash = twinBcrypt.hashSync(req.body.password),
						secret = crypto.randomBytes(256);
					User.findOne({name: req.body.username}, function(err, result) {
						if (err) {
							throw new Error(err);
						}
						if (result) {
							self.parse({
								page: 'signup',
								error: {
									username: true
								}
							}, callback);
						} else {

							var user = new User({
								name: req.body.username,
								password: hash,
								email: req.body.email,
								active: true,
								last_ip: req.connection.remoteAddress,
								secret: secret
							});
							user.save(function(err, data) {
								if (err) throw new Error(err);

								req.session.uid = data._id;
								req.session.ustr = twinBcrypt.hashSync(data._id + salt + req.connection.remoteAddress + req.headers['user-agent']);
							
								var pos = req.routes.indexOf(req.routes[1]);
								if (~pos) {
									req.routes.splice(pos, 1);
									res.writeHead(302, {
										'Location': '/' + req.routes.join('/')
									});
									res.end();
									return;
								} else {
									callback();
								}
							});
						}
					});
				} else if(req.routes[1] === 'recovery') {
					// recover password
					callback();
				}
			} else {
				// validation
				req.checkBody('username', 'required').notEmpty();
				req.checkBody('password', '6 to 20 characters required').len(6, 20);
				var errors = req.validationErrors(true);
				if (errors) {
					console.log(errors);
				}
				
				// login
				User.findOne({name: req.body.username}, function(err, result) {
					if (err) {
						throw new Error(err);
					}
					if (result && twinBcrypt.compareSync(req.body.password, result.password)) {
						req.session.uid = result._id;
						req.session.ustr = twinBcrypt.hashSync(result._id + salt + req.connection.remoteAddress + req.headers['user-agent']);
						res.writeHead(302, {
							'Location': '/' + req.routes.join('/')
						});
						res.end();
						return;
					} else {
						self.parse({
							page: 'sign_in',
							error: {
								combination: true
							}
						}, callback);
					}
				});
			}
		// load normal pages
		} else  {
			var page = '';
			if(typeof req.routes[1] !== 'undefined' && ~pages.indexOf(req.routes[1])) {
				page = req.routes[1];
			} else {
				page = 'sign_in';
			}
			self.parse({
				page: page
			}, callback);
		} 
	}
}

Authentication.prototype.parse = function(opt, callback) {
	languages.getTranslation('authentication', function(data) {
		var fn = jade.compileFile(__dirname + '/jade/authentication.jade', __jade),
			locals = merge({
				language: data
			}, opt),
			html = fn(locals);

		callback(null, html);
	});
}

module.exports = exports = Authentication;