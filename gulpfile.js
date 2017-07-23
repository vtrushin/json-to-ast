var del = require('del');
var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
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
  return gulp.src('src/**/*.js')
    .pipe(sourcemaps.init())
    .pipe(babel({
        presets: ['es2015']
    }))
    .on('error', function(err) {
      console.log(err.toString())
      this.emit('end')
    })
    .pipe(sourcemaps.write('.'))
		.pipe(gulp.dest(distJsPath))
});

gulp.task('es6:watch', function () {
  gulp.start('es6');
	gulp.watch(src + '/**/*.js', ['es6']);
});
