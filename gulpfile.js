var gulp = require('gulp');
var babel = require('gulp-babel');
var concat = require('gulp-concat');
var readFileSync = require('fs').readFileSync;

var babelrc = JSON.parse(readFileSync('.babelrc', 'utf-8'))

gulp.task('default', function () {
  return gulp.src('src/**/*.js')
    .pipe(babel(babelrc))
    .pipe(concat('index.js'))
    .pipe(gulp.dest('dist'));
});
