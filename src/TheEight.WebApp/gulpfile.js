var gulp = require('gulp');
var sass = require('gulp-sass');
var del = require('del');
var concat = require('gulp-concat');

gulp.task('default', ['sass']);

gulp.task('glyphicons', function() {
    return gulp.src('src/styles/glyphicons-fonts/*')
        .pipe(gulp.dest('dist/styles/glyphicons-fonts/'));
});

gulp.task('sass', function() {
    return gulp.src('src/styles/site.scss')
        .pipe(sass())
        .pipe(gulp.dest('dist/styles'));
});

gulp.task('sass:watch', function () {
    gulp.watch('src/styles/**/*', ['sass']);
});