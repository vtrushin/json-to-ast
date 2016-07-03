'use strict';

const del = require('del');
const gulp = require('gulp');
const rollup = require('gulp-rollup');
const babel = require('gulp-babel');
const handleErrors = require('./utils/handleErrors');

const src = './src';
const dist = './dist';
const es6Path = [
	src + '/Parser.js',
	src + '/error.js',
	src + '/parse.js',
	src + '/errorTypes.js',
	src + '/tokenize.js'
];
const distJsPath = dist;

gulp.task('default', [
	'clean',
	'es6',
	'es6:watch'
]);

// Delete the dist directory
gulp.task('clean', function(){
	return del([dist + '/*']);
});

gulp.task('es6', function(){
	gulp.src(src + '/**/*.js')
		.pipe(
			rollup({
				format: 'cjs'
		    })
		    .on('error', handleErrors)
		)
		.pipe(
			babel().on('error', handleErrors)
		)
		.pipe(gulp.dest(distJsPath))
});

gulp.task('es6:watch', function () {
	gulp.watch(src + '/**/*.js', ['es6']);
});
