const gulp = require("gulp")
const webdriver = require("gulp-webdriver")

gulp.task("default", () => {
  return gulp
    .src("wdio.conf.js")
    .pipe(webdriver())
})
