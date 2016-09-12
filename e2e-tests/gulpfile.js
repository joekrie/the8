const gulp = require("gulp")
const webdriver = require("gulp-webdriver")
const rimraf = require("rimraf")

gulp.task("default", ["e2e-test"])

gulp.task("e2e-test", () => {
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

gulp.task("e2e-test:ci", () => {
  const config = {
    reporters: ["spec", "junit"],
    reporterOptions: {
      junit: {
        outputDir: "./e2e-tests/test-results"
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

gulp.task("clean:e2e-test:ci", done => {
  rimraf(".e2e-tests/test-results", done)
})

