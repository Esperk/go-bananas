/*
 * Go Bananas
 *
 * Copyright (c) 2014 Ferry Kobus - Webmonkeys
 */

"use strict";

var routes = require(__lib + 'routes'),
	jade = require('jade'),
	mongoose = require('mongoose'),
	languages = require(__lib + 'languages'),
	jade_options = {
		basedir: __root + 'panel/themes/default/'
	};

function Authentication() {
	return function(callback) {
		this.go(function(err, out) {
			callback(err, out);
		});
	}.bind(this);
}

Authentication.prototype.go = function(callback) {
	switch (routes.params[1]) {
		case 'signup':
			if(routes.method === 'POST') {
				console.log(routes.data);
				callback();
			} else {
				this.showSignupForm(function(data) {
					callback(null, {
						status: 200,
						body: data
					});
				});
			}
			break;
		case 'recovery':
			if(routes.method === 'POST') {
				console.log(routes.data);
				callback();
			} else {
				this.showRecoveryForm(function(data) {
					callback(null, {
						status: 200,
						body: data
					});
				});
			}
			break;
		default:
			if(routes.params.length === 1) {
				if(routes.method === 'POST') {
					console.log(routes.data);
					callback();
				} else {
					this.showLoginForm(function(data) {
						callback(null, {
							status: 200,
							body: data
						});
					});
				}
			} else {
				callback();
			}
			break;
	}
};

Authentication.prototype.showLoginForm = function(callback) {
	var fn = jade.compileFile(__dirname + '/jade/login.jade', jade_options);
	//languages.addTranslation('showLoginForm', {field:{username:{label:'Username'},password:{label:'Password'}},button:{login:{label:'Sign in'}},links:{signup:{label:'Signup'},forgot_password:{label:'Forgot password?'}}}, 'en');
	//languages.addTranslation('showLoginForm', {field:{username:{label:'Gebruikersnaam'},password:{label:'Wachtwoord'}},button:{login:{label:'Inloggen'}},links:{signup:{label:'Inschrijven'},forgot_password:{label:'Wachtwoord vergeten?'}}}, 'nl');

	languages.getTranslation('showLoginForm', function(data) {
		var body = fn(data);
		callback(body);
	});
}


Authentication.prototype.showRecoveryForm = function(callback) {
	var fn = jade.compileFile(__dirname + '/jade/recovery.jade', jade_options);
	//languages.addTranslation('showRecoveryForm', {field:{email:{label:'Email address'}},button:{recovery:{label:'Recover'}},links:{signup:{label:'Signup'},login:{label:'Sign in'}}}, 'en');
	//languages.addTranslation('showRecoveryForm', {field:{email:{label:'E-mail adres'}},button:{recovery:{label:'Herstellen'}},links:{signup:{label:'Inschrijven'},login:{label:'Inloggen'}}}, 'nl');

	languages.getTranslation('showRecoveryForm', function(data) {
		var body = fn(data);
		callback(body);
	});
}

Authentication.prototype.showSignupForm = function(callback) {
	var fn = jade.compileFile(__dirname + '/jade/signup.jade', jade_options);
	//languages.addTranslation('showSignupForm', {field:{email:{label:'Email address'},username:{label:'Username'},password:{label:'Password'},confirm:{label:'Confirm password'}},button:{signup:{label:'Sign up'}},links:{login:{label:'Sign in'},forgot_password:{label:'Forgot password?'}}}, 'en');
	//languages.addTranslation('showSignupForm', {field:{email:{label:'E-mail adres'},username:{label:'Gebruikersnaam'},password:{label:'Wachtwoord'},confirm:{label:'Bevestig wachtwoord'}},button:{signup:{label:'Aanmelden'}},links:{login:{label:'Inloggen'},forgot_password:{label:'Wachtwoord vergeten?'}}}, 'nl');
	
	languages.getTranslation('showSignupForm', function(data) {
		var body = fn(data);
		callback(body);
	});
}

module.exports = exports = Authentication;