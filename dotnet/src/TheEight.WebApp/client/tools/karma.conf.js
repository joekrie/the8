const webpackConfig = require("./webpack.config.js")

const testsGlob = "../app/**/records/__tests__/**/*.tests.js"

module.exports = config => {
  config.set({
    preprocessors: {
      [testsGlob]: ["webpack"]
    },
    webpack: webpackConfig,
    webpackMiddleware: {
      noInfo: true
    },
    basePath: "",
    frameworks: ["jasmine"],
    files: [
      testsGlob
    ],
    exclude: [],
    reporters: ["progress", "junit"],
    junitReporter: {
      outputDir: "./test-results/junit"
    },
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ["Chrome"],
    concurrency: Infinity
  })
}
