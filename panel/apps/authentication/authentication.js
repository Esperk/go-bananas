/*
 * Go Bananas
 *
 * Copyright (c) 2014 Ferry Kobus - Webmonkeys
 */

"use strict";

var jade = require('jade'),
	languages = require(__lib + 'languages'),
	merge = require('utils-merge'),
	User = require(__models + 'user'),
	twinBcrypt = require('twin-bcrypt'),
	crypto = require('crypto'),
	jade_options = {
		basedir: __root + 'panel/themes/default/'
	},
	salt = '#&a91279&*(*&T^&*%Th7|22fs7d';

function Authentication() {
	var self = this;

	return function(req, res, callback) {
		var pages = ['signup', 'recovery'];

		if (typeof req.session.uid !== 'undefined' && req.session.ustr !== 'undefined') {
			if (twinBcrypt.compareSync(req.session.uid + salt + req.connection.remoteAddress + req.headers['user-agent'], req.session.ustr)) {
				callback(null, {
					loggedIn: true
				});
				return;
			}
		}

		// handle post
		if (req.method === 'POST' && typeof req.params !== 'undefined' && ((typeof req.params[1] !== 'undefined' && ~pages.indexOf(req.params[1])) || typeof req.params[1] === 'undefined')) {
			if(typeof req.params[1] === 'undefined') {
				// login
				User.findOne({name: req.body.username}, function(err, result) {
					if (err) {
						throw new Error(err);
					}
					if (result && twinBcrypt.compareSync(req.body.password, result.password)) {
						req.session.uid = result._id;
						req.session.ustr = twinBcrypt.hashSync(result._id + salt + req.connection.remoteAddress + req.headers['user-agent']);
						req.params.splice(pos, 1);
						res.writeHead(302, {
							'Location': '/' + req.params.join('/')
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
			} else if(req.params[1] === 'signup') {
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
						
							var pos = req.params.indexOf(req.params[1]);
							if (~pos) {
								req.params.splice(pos, 1);
								res.writeHead(302, {
									'Location': '/' + req.params.join('/')
								});
								res.end();
								return;
							} else {
								callback();
							}
						});
					}
				});
			} else if(req.params[1] === 'recovery') {
				// recover password
				callback();
			}
		// load normal pages
		} else if (typeof req.params !== 'undefined') {
			var page = '';
			if(typeof req.params[1] !== 'undefined' && ~pages.indexOf(req.params[1])) {
				page = req.params[1];
			} else if(typeof req.params[1] === 'undefined') {
				page = 'sign_in';
			} else {
				callback();
				return;
			}
			self.parse({
				page: page
			}, callback);
		} else {
			callback();
		}
	}
}

Authentication.prototype.parse = function(opt, callback) {
	languages.getTranslation('authentication', function(data) {
		var fn = jade.compileFile(__dirname + '/jade/authentication.jade', jade_options),
			locals = merge({
				language: data
			}, opt),
			body = fn(locals);

		callback(null, {
			status: 200,
			body: body
		});
	});
}

module.exports = exports = Authentication;