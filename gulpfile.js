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
gulp.task('lint', function () {
	return gulp.src([
		'src/**'
	])
		.pipe(plugins.eslint())
		.pipe(plugins.eslint.format())
		.on('error', plugins.util.log);
});

gulp.task('compile', function() {
	return gulp.src('src/analyticStream.js')
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
		.pipe(gulp.dest('./public/dist'));
});

// Lint project files and minify them into two production files.
gulp.task('build', ['compile']);

gulp.task('default', ['lint', 'build']);


gulp.task('watch', ['lint', 'build', 'run'], () => {
	return gulp.watch('src/**', ['build']);
});

gulp.task('run', ['build'], () => {
	return gulp.src('public')
		.pipe(plugins.webserver({
			livereload: true,
			directoryListing: false,
			port: 8080
		}));
});
