const webpackConfig = require("./webpack.config.common.js")

const testsGlob = "../client/app/**/__tests__/**/*.testsx.js"

module.exports = function (config) {
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
    reporters: ["progress"],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ["Chrome"],
    singleRun: false,
    concurrency: Infinity
  })
}
