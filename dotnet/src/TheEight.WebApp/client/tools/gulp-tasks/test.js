const gulp = require("gulp")
const KarmaServer = require("karma").Server
const path = require("path")
const rimraf = require("rimraf")

const configFile = path.join(__dirname, "../karma.conf.js")
const browsers = ["PhantomJS", "Chrome", "Firefox", "IE"]

gulp.task("test", done => {
  new KarmaServer({
    configFile,
    singleRun: true,
    browsers,
    reporters: ["spec"]
  }, done).start()
})

gulp.task("test:ci", done => {
  new KarmaServer({
    configFile,
    browsers: ["PhantomJS"],    
    reporters: ["spec", "junit"],
    junitReporter: {
      outputDir: "./test-results"
    },
  }, done).start()
});

gulp.task("test:watch", done => {
  new KarmaServer({
    configFile,
    browsers
  }, done).start()
})

gulp.task("clean:test", done => {
  rimraf("./test-results", done)
})
