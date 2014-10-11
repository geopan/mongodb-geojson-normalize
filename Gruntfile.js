module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		simplemocha: {
			all:  {
				src: ['test/*.js']
			}
		},
		mocha: {
			all: ['test/test.js'],
			options: {
				run: true
			}
		},
		jshint: {
			files: ['index.js', 'test/test.js']
		}
	});

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-simple-mocha');

	grunt.registerTask('default', ['jshint', 'simplemocha']);
};
