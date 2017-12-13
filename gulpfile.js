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
		'src/**'
	])
		.pipe(plugins.eslint())
		.pipe(plugins.eslint.format())
		.on('error', plugins.util.log);
});

gulp.task('compile', function() {
	gulp.src('src/analyticStream.js')
		.pipe(plugins.sourcemaps.init())
		.pipe(plugins.babel({
			'presets': [
				['env', {
					'targets': {
						'browsers': ['last 2 versions', 'ie >= 11']
					}
				}]
			]
		}))
		.pipe(plugins.sourcemaps.write('.'))
		.pipe(gulp.dest('./public'));
});

// Lint project files and minify them into two production files.
gulp.task('build', ['eslint', 'compile']);

gulp.task('default', ['build']);

