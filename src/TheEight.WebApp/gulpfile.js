/// <binding AfterBuild='default' />

var gulp = require("gulp");
var sass = require("gulp-sass");
var del = require("del");
var webpack = require("webpack-stream");

gulp.task("default", ["sass", "webpack"]);
gulp.task("watch", ["sass:watch"]);

gulp.task("sass", function() {
    return gulp.src("client/styles/site.scss")
        .pipe(sass())
        .pipe(gulp.dest("wwwroot/styles"));
});

gulp.task("sass:watch", function () {
    return gulp.watch("client/styles/**/*", ["sass"]);
});

gulp.task("webpack", function() {
    var config = require('./webpack.config.js');

    return gulp
        .src('client/app/{client,server}.js')
        .pipe(webpack(config))
        .pipe(gulp.dest("wwwroot/app"));
});