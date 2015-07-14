var gulp = require('gulp');
var traceur = require('gulp-traceur');
var ts = require('gulp-typescript');
var jasmine = require('gulp-jasmine');
//var sass = require('gulp-sass');
var del = require('del');
var runSequence = require('run-sequence');
var combiner = require('stream-combiner2');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');
var angularEs5 = require('angular2/es6/dev/es5build');

gulp.task('default', function () {
    processAngular();
});

gulp.task('clean', function () {
    // place code for your clean task here
});

gulp.task('build', function () {
    compileTypescript();
});

gulp.task('setup-static', function () {
    processAngular();
    copySystemJs();
});

gulp.task('test', function () {
    // place code for your test task here
});

function compileTypescript() {
    return gulp
        .src(['static/scripts/**/*.ts', 'static/libs/angular2/angular2.ts'])
        .pipe(ts(ts.createProject('tsconfig.json')))
        .js
        .pipe(traceur())
        .pipe(gulp.dest('static/scripts'));
}

function processAngular() {
    return angularEs5({
        src: 'node_modules/angular2/es6/dev',
        dest: 'static/libs/angular2',
        modules: 'commonjs'
    });
}

function copySystemJs() {
    return gulp
        .src(['node_modules/systemjs/dist/system.js',
            'node_modules/systemjs/dist/system.js.map'])
        .pipe(gulp.dest('static/libs/systemjs'));
}

//function compileSass() {
//    return gulp.src('static/styles/**/*.scss')
//       .pipe(sass())
//       .pipe(gulp.dest('static/styles'));
//}