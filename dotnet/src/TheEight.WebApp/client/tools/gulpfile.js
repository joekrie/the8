const gulp = require("gulp")

require("./gulp-tasks/build")
require("./gulp-tasks/test")

gulp.task("default", ["test", "lint", "build"])
