/// <binding AfterBuild='default' />

var gulp = require('gulp');
var sass = require('gulp-sass');
var del = require('del');
var concat = require('gulp-concat');

gulp.task('default', ['sass']);

gulp.task('glyphicons', function() {
    return gulp.src('client/styles/glyphicons-fonts/*')
        .pipe(gulp.dest('wwwroot/styles/glyphicons-fonts/'));
});

gulp.task('sass', function() {
    return gulp.src('client/styles/site.scss')
        .pipe(sass())
        .pipe(gulp.dest('wwwroot/styles'));
});

gulp.task('sass:watch', function () {
    gulp.watch('client/styles/**/*', ['sass']);
});