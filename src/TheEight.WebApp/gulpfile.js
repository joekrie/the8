/// <binding AfterBuild='default' ProjectOpened='watch' />

var gulp = require('gulp');
var sass = require('gulp-sass');
var del = require('del');
var concat = require('gulp-concat');
var gutil = require('gulp-util');
var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');

var webpackConfig = require('./webpack.config.js')

gulp.task('default', ['sass']);
gulp.task('watch', ['sass:watch']);

gulp.task('sass', function() {
    return gulp.src('client/styles/site.scss')
        .pipe(sass())
        .pipe(gulp.dest('wwwroot/styles'));
});

gulp.task('sass:watch', function () {
    gulp.watch('client/styles/**/*', ['sass']);
});

gulp.task("webpack", function (callback) {
    webpack(webpackConfig, function (err, stats) {
        if (err) {
            throw new gutil.PluginError("webpack", err);
        }

        gutil.log("[webpack]", stats.toString({
            // output options
        }));

        callback();
    });
});

gulp.task("webpack-dev-server", function (callback) {
    var compiler = webpack(webpackConfig);

    new WebpackDevServer(compiler, {})
        .listen(8082, "localhost", function (err) {
            if (err) {
                throw new gutil.PluginError("webpack-dev-server", err);
            }

            gutil.log("[webpack-dev-server]", "http://localhost:8082/webpack-dev-server/index.html");
            callback();
        });
});