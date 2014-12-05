/**
 * Authentication application
 *
 * Copyright (c) 2014 Ferry Kobus - Webmonkeys
 */

"use strict";

var __root = global.__root,
	__lib = global.__lib,
	__theme = global.__theme,
	async = require('async'),
	util = require('util'),
	users = require(__lib + 'users'),
	parser = require(__lib + 'parser'),
	merge = require('utils-merge'),
	mailer = require(__lib + 'mailer'),
	authApp = require(__root + 'apps/authentication/authentication');

/**
 * extend functions from apps/authentication
 * we do this to prevent duplicate code
 * and reusable code in the frontend ;)
 */
util.inherits(Authentication, authApp);

/**
 * Represents the authentication app
 * @constructor
 * @param {int} dpt - Depth to look for endpoints for authentication pages
 */
function Authentication(dpt) {
	var self = this,
		depth = dpt || 1;

	return function(req, res, callback) {
		// reroute logout?
		if (self.routes.logout === req.routes[depth]) {
			self.request(depth, req, res, callback);
		} else {
			self.loggedIn(req, function(err, loggedIn) {
				if (err) {
					callback(err);
				} else {
					if (loggedIn) {
						callback(null, true);
					} else {
						self.request(depth, req, res, callback);
					}
				}
			});
		}
	}
}


/**
 * login
 *
 * loops through the post data and checks the given input
 *
 * @param {object} req
 * @param {function} callback - The callback function
 */
Authentication.prototype.login = function(req, res, callback) {
	var errors = {},
		self = this;

	if (req.xhr) {
		this.parseXhr(req, callback);
	} else if (req.method === 'POST') {
		async.waterfall([
			function(callback) {
				self.checkPost(req, function(errors) {
					if (errors) {
						callback(errors);
					} else {
						callback();
					}
				});
			},
			function(callback) {
				users.findUser(req.body.username, function(err, data) {
					if (err) {
						callback(err);
					}
					if (!data) {
						callback({
							username: {
								msg: 'username_404'
							}
						});
					} else {
						callback(null, data);
					}
				});
			},
			function(user, callback) {
				self.validatePassword(user, req.body.password, function(err) {
					if (err) {
						callback(err);
					} else {
						callback(null, user);
					}
				});
			},
			function(user, callback) {
				self.setSession(user, req, function() {
					res.writeHead(302, {
						'Location': '/' + req.routes.join('/')
					});
					res.end();
					callback();
				});
			}
		],
		function(err) {
			if (err) {
				if (typeof err === 'object') {
					self.renderPage('sign_in', err, req, callback);
				} else {
					callback(err);
				}
			} else {
				callback();
			}
		});
	} else {
		this.renderPage('sign_in', errors, req, callback);
	}
};

/**
 * signup
 *
 * Generates signup pages
 *
 * @param {object} req
 * @param {object} res
 * @param {function} callback - The callback function
 */
Authentication.prototype.signup = function(req, res, callback) {
	var self = this,
		save = true,
		user = {};

	if (req.xhr) {
		this.parseXhr(req, callback);
	} else if (req.method === 'POST') {
		async.series([
			function(callback) {
				users.findUser(req.body.username, function(err, data) {
					if (err) {
						callback(err);
					}
					if (data) {
						save = false;
						callback(null, {
							username: {
								msg: 'username_exists'
							}
						});
					} else {
						callback();
					}
				});
			},
			function(callback) {
				users.findUserByEmail(req.body.email, function(err, data) {
					if (err) {
						callback(err);
					}
					if (data) {
						save = false;
						callback(null, {
							email: {
								msg: 'email_exists'
							}
						});
					} else {
						callback();
					}
				});
			},
			function(callback) {
				if (req.body.password !== req.body.confirm_password) {
					save = false;
					callback(null, {
						password: {
							msg: 'no_match'
						}
					});
				} else {
					callback();
				}
			},
			function(callback) {
				if (save === true) {
					users.addUser(req.body.username, req.body.password, req.body.email, req.connection.remoteAddress, function(err, data) {
						if (err) {
							callback(err);
						}
						if (!data) {
							callback(null, {
								user: {
									msg: 'user_creation_failed'
								}
							});
						} else {
							user = data;
							callback();
						}
					});
				} else {
					callback();
				}
			},
			function(callback) {
				if (save && Object.keys(user).length > 0) {
					self.setSession(user, req, function() {
						var pos;
						if (~(pos = req.routes.indexOf(self.command))) {
							req.routes.splice(pos, 1);
							res.writeHead(302, {
								'Location': '/' + req.routes.join('/')
							});
							res.end();
							callback();
						} else {
							callback();
						}
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
			var errors = {};
			for (var key in results) {
				if (typeof results[key] !== 'undefined') {
					errors = merge(errors, results[key]);
				}
			}
			if(Object.keys(errors).length > 0) {
				self.renderPage('signup', errors, req, callback);
			} else {
				callback();
			}
		});
	} else {
		this.renderPage('signup', {}, req, callback);
	}
};

/**
 * recover
 *
 * Generates recover pages
 *
 * @param {object} req
 * @param {object} res
 * @param {function} callback - The callback function
 */
Authentication.prototype.recover = function(req, res, callback) {
	var self = this,
		send = true,
		user = {},
		mail = {},
		hash = '';

	if (req.xhr) {
		this.parseXhr(req, callback);
	} else if(req.method === 'POST') {
		async.series([
			function(callback) {
				users.findUserByEmail(req.body.email, function(err, data) {
					if (err) {
						callback(err);
					}
					if (!data) {
						send = false;
						callback(null, {
							email: {
								msg: 'email_not_found'
							}
						});
					} else {
						user = data;
						callback();
					}
				});
			},
			function(callback) {
				if (send) {
					users.activateRecovery(user, function(err, result) {
						if (err) {
							callback(err);
						} else {
							hash = result;
							callback();
						}
					});
				} else {
					callback();
				}
			},
			function(callback) {
				if(hash !== '') {
					mailer.renderMail({
						templateDirectory: __theme + 'apps/authentication/jade/mails/',
						template: 'recovery',
						email: req.body.email,
						translation: 'recover_mail',
						locals: {
							user: user,
							hash: hash
						} 
					}, function(err, data) {
						if (err) {
							callback(err);
						}
						mail = data;
						callback();
					});
				} else {
					callback();
				}
			}, function(callback) {
				if(typeof mail.html !== 'undefined') {
					mailer.sendMail(mail, user, function(err, response) {
						if (err) {
							callback(err);
						}
						if (response.substr(0, 12) === '250 2.0.0 OK') {
							callback();
						} else {
							callback('Mail not send');
						}
					});
				} else {
					callback();
				}
			}
		], function(err, results) {
			if (err) {
				callback(err);
			}
			var errors = {};
			for (var key in results) {
				if (typeof results[key] !== 'undefined') {
					errors = merge(errors, results[key]);
				}
			}
			if(Object.keys(errors).length > 0) {
				self.renderPage('recovery', errors, req, callback);
			} else {
				res.end();
				callback();
			}
		});
	} else {
		this.renderPage('recovery', {}, req, callback);
	}
};

/**
 * renderPage
 *
 * Function that parses the given template with the given variables
 * @param {string} page - Which page to parse
 * @param {object} errors - Object that contains conflicting fields and error messages
 * @param {function} callback - The callback function
 */
Authentication.prototype.renderPage = function(page, errors, req, callback) {
	parser.parse(__theme + 'apps/authentication/jade/' + page + '.jade', 'authentication', {
		post: req.body,
		errors: errors
	}, function(err, data) {
		if (err) {
			callback(err);
		}
		callback(null, data);
	});
};

module.exports = exports = Authentication;