'use strict';
/* eslint no-console: "off" */

/**
 * Module dependencies.
 */
const
	gulp = require('gulp'),
	plugins = require('gulp-load-plugins')();

/*
 * JS linting task
 */
gulp.task('eslint', function () {
	return gulp.src([
		'analyticStream.js'
	])
		.pipe(plugins.eslint())
		.pipe(plugins.eslint.format())
		.on('error', plugins.util.log);
});

// Lint project files and minify them into two production files.
gulp.task('build', ['eslint']);

gulp.task('default', ['build']);

