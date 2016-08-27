const gulp = require("gulp")
const webdriver = require("gulp-webdriver")
const rimraf = require("rimraf")

gulp.task("default", ["test"])

gulp.task("test", () => {
  const config = {
    reporters: ["spec"],
    capabilities: [
      {
        maxInstances: 5,
        browserName: "chrome"
      }
    ],
    services: ["selenium-standalone"]
  }

  return gulp
    .src("wdio.conf.js")
    .pipe(webdriver(config))
})

gulp.task("test:ci", () => {
  const config = {
    reporters: ["spec", "junit"],
    reporterOptions: {
      junit: {
        outputDir: "./test-results"
      }
    },
    services: ["phantomjs"],
    capabilities: [
      {
        maxInstances: 5,
        browserName: "chrome"
      }
    ]
  }

  return gulp
    .src("wdio.conf.js")
    .pipe(webdriver(config))
})

gulp.task("clean:test:ci", done => {
  rimraf("./test-results", done)
})
