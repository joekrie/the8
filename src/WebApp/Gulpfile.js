var gulp = require("gulp");
var sass = require("gulp-sass");
var del = require("del");
var concat = require("gulp-concat");

var sassPaths = ["wwwroot/**/*.scss", "!wwwroot/libs/**/*.scss"];
var appPaths = ["wwwroot/utilities/*.js", "wwwroot/app/**/module.js", "wwwroot/app/**/{*, !module}.js"];

gulp.task("default", ["sass", "concat"]);
gulp.task("watch", ["sass:watch", "concat-app:watch"]);

gulp.task("sass", function() {
    return gulp.src(sassPaths)
        .pipe(sass())
        .pipe(gulp.dest("wwwroot"));
});

gulp.task("sass:watch", function () {
    return gulp.watch(sassPaths, ["sass"]);
});

gulp.task("clean", function(cb) {
    del.sync(["wwwroot/libs/libs.css", "wwwroot/libs/libs.js", "wwwroot/app/app.js"]);
    cb();
});

gulp.task("concat", ["concat-app", "concat-libs-js", "concat-libs-css"]);

gulp.task("concat-app", function () {
    del.sync("wwwroot/app/app.js");

    return gulp.src(appPaths)
        .pipe(concat("app.js"))
        .pipe(gulp.dest("wwwroot/app/"));
});

gulp.task("concat-app:watch", function () {
    return gulp.watch(appPaths, ["concat-app"]);
});

gulp.task("concat-libs-js", function () {
    del.sync("wwwroot/libs/libs.js");

    return gulp.src([
            "wwwroot/libs/bower_components/angular/angular.js",
            "wwwroot/libs/bower_components/lodash/lodash.min.js",
            "wwwroot/libs/bower_components/moment/min/moment.min.js",
            "wwwroot/libs/bower_components/ng-sortable/dist/ng-sortable.min.js",
            "wwwroot/libs/bower_components/rome/dist/rome.min.js",
            "wwwroot/libs/bower_components/xregexp/min/xregexp-all-min.js",
            "wwwroot/libs/bower_components/modernizr/modernizr.js",
            "wwwroot/libs/bower_components/spinjs/spin.min.js"            
        ])
        .pipe(concat("libs.js"))
        .pipe(gulp.dest("wwwroot/libs/"));
});

gulp.task("concat-libs-css", function () {
    del.sync("wwwroot/libs/libs.css");

    return gulp.src([
            "wwwroot/libs/bower_components/normalize-css/normalize.css",
            "wwwroot/libs/bower_components/ng-sortable/dist/ng-sortable.min.css",
            "wwwroot/libs/bower_components/rome/dist/rome.min.css",
            "wwwroot/libs/glyphicons/css/glyphicons.css"
        ])
        .pipe(concat("libs.css"))
        .pipe(gulp.dest("wwwroot/libs/"));
});