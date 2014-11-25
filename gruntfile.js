/*
 * Go Bananas
 *
 * Grunfile.js
 */

"use strict";

module.exports = function(grunt) {
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-compass');
	grunt.initConfig({
		uglify: {
			my_target: {
				files: {
					'panel/themes/default/js/script.js': ['panel/themes/default/js/dev/*.js'],
					'public/themes/*/js/script.js': ['public/themes/*/js/dev/*.js']
				}
			}
		},
		compass: {
			dev: {
				options: {
					config: 'config.rb'
				}
			}
		},
		watch: {
			scripts: {
				files: ['panel/themes/default/js/dev/*.js', 'public/themes/*/js/dev/*.js'], 
				tasks: ['uglify']
			},
			sass: {
				files: ['panel/themes/default/sass/*.scss'],
				tasks: ['compass:dev']
			}
		}
	})
	grunt.registerTask('default', 'watch');
};