var del = require('del');
var gulp = require('gulp');
var rollup = require('gulp-rollup');
var babel = require('gulp-babel');
var handleErrors = require('./utils/handleErrors');

var src = './src';
var dist = './dist';
var distJsPath = dist;

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
	gulp.src(src + '/parse.js')
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
  gulp.src(src + '/stringify.js')
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
  gulp.start('es6');
	gulp.watch(src + '/**/*.js', ['es6']);
});
