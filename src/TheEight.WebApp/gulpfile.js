var gulp = require('gulp');
var sass = require('gulp-sass');
var del = require('del');
var concat = require('gulp-concat');
var jspm = require('gulp-jspm');
var exec = require('child_process').execSync;

gulp.task('default', ['jspm', 'sass']);

// todo: get gulp-jspm working
gulp.task('jspm', function () {
    var cmd = 'jspm bundle-sfx src/app/boat-lineup-planner/main dist/app/boat-lineup-planner/main.js';
    exec(cmd, function (err, stdout, stderr) {
        if (err) { throw err; }
    });
    
    //return gulp.src('src/app/**/main.js')
    //    .pipe(jspm())
    //    .pipe(gulp.dest('dist/app'));
});

gulp.task('glyphicons', function() {
    return gulp.src('src/libs/glyphicons/**/*')
        .pipe(gulp.dest('dist/libs/glyphicons'));
});

gulp.task('sass', function() {
    return gulp.src('src/styles/site.scss')
        .pipe(sass())
        .pipe(gulp.dest('dist/styles'));
});