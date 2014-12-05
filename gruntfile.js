/*
 * Go Bananas
 *
 * Grunfile.js
 */

"use strict";

module.exports = function(grunt) {
	require('load-grunt-tasks')(grunt);
	grunt.initConfig({
		bower_api: {
			install: {
	      options: {
					clearAssets: true,
          clearBower: true,
          assetsDirectory: './public/assets',
          install: true,
          copy: true,
          preservePaths: false,
          copyTo: {
            '.js': './public/assets/js',
            '.css': './public/assets/css'
          }
	      }
	    },
	    cleanup: {
	    	options: {
					clearAssets: true,
          clearBower: true,
          install: false,
          copy: false
        }
	    }
		},
		uglify: {
			bananas: {
				options: {
					mangle: true,
					compress: true
				},
				files: {
					'public/panel/themes/default/js/script.min.js': ['panel/themes/**/js/*.js', 'panel/themes/default/apps/**/js/*.js']
					//'public/themes/default/js/script.min.js': ['public/themes/**/js/dev/*.js']
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
				files: ['panel/themes/**/js/*.js', 'panel/themes/**/apps/**/js/*.js'], 
				tasks: ['uglify:bananas']
			},
			sass: {
				files: ['panel/themes/default/sass/*.scss'],
				tasks: ['compass:dev']
			}
		}
	});
	// default task, just run watch for compass and js uglify
	grunt.registerTask('default', ['uglify:bananas', 'compass:dev', 'watch']);
	grunt.registerTask('bower', ['bower_api:install']);
	grunt.registerTask('bower_cleanup', ['bower_api:cleanup']);
};