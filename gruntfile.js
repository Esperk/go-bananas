/*
 * Go Bananas
 *
 * Grunfile.js
 */

"use strict";

module.exports = function(grunt) {
	require('load-grunt-tasks')(grunt);
	grunt.initConfig({
		uglify: {
			bananas: {
				options: {
					mangle: true,
					compress: true
				},
				files: {
					'panel/themes/default/js/script.min.js': ['panel/themes/*/js/dev/*.js', 'public/assets/js/*.js'],
					'public/themes/*/js/script.min.js': ['public/themes/*/js/dev/*.js', 'public/assets/js/*.js']
				}
			},
		},
		compass: {
			dev: {
				options: {
					config: 'config.rb',
					require: 'susy'
				}
			}
		},
		watch: {
			scripts: {
				files: ['panel/themes/*/js/dev/*.js', 'public/themes/*/js/dev/*.js', 'public/assets/js/*.js'], 
				tasks: ['uglify:bananas']
			},
			sass: {
				files: ['panel/themes/default/sass/*.scss'],
				tasks: ['compass:dev']
			}
		}
	});
	// default task, just run watch for compass and js uglify
	grunt.registerTask('default', ['watch']);

	// install bower deps automatic
	grunt.registerTask('install', 'Install bower dependencies', function() {
		var bower = require('bower'),
			fs = require('fs'),
			glob = require('glob'),
			wrench = require('wrench'),
			exec = require('child_process').exec,
			done = this.async();

		bower
			.commands
			.install([], {})
			.on('log', function(result) {
				grunt.log.writeln(['bower', result.id.cyan, result.message].join(' '));
			})
			.on('error', function() {
				done(false);
			})
			.on('end', function(results) {
				for (var key in results) {
					var pack = results[key],
						main = pack.pkgMeta.main;
					
					if (typeof main === 'object') {
						for (var index in main) {
							var file = main[index];
							if (file.match(/([*])$/gm)) {
								while (file.charAt(0) === '.' || file.charAt(0) === '/') {
									file = file.substr(1);
								}
								var files = glob.sync(pack.canonicalDir + '/' + file);
								if (typeof files === 'object') {
									for (var k in files) {
										var file = files[k].replace(pack.canonicalDir+'/', '');
										copyMainFile(pack.canonicalDir, file);
									}
								}
							} else {
								copyMainFile(pack.canonicalDir, file);
							}
						}
					} else {
						copyMainFile(pack.canonicalDir, main);
					}
				}
				done();
			});

		// copy files
		function copyMainFile(sourceDirectory, mainFile) {
			var parts = mainFile.split('/'),
				file = parts[parts.length-1],
				subdir = '',
				destination = __dirname + '/public/assets/';
			while (mainFile.charAt(0) === '.' || mainFile.charAt(0) === '/') {
				mainFile = mainFile.substr(1);
			}
			if(~file.indexOf('.js')) {
				subdir = 'js/';
			} else if(~file.indexOf('.css')) {
				subdir = 'css/';
			} else {
				parts.pop();
				subdir = parts.join('/')+'/';
			}
			destination += subdir;
			wrench.mkdirSyncRecursive(destination, '0755');
			destination += file;
			if (fs.existsSync(destination)) {
				fs.unlinkSync(destination);
			}
			fs.createReadStream(sourceDirectory + '/' + mainFile).pipe(fs.createWriteStream(destination));
			grunt.log.writeln(['copied', file.cyan, '/public/assets/' + subdir + file].join(' '));
		}
	});
};