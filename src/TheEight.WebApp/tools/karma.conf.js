const webpackConfig = require("./webpack-base.config.js")

module.exports = function (config) {
  config.set({
    preprocessors: {
      "../**/*.tests.js": ["webpack"]
    },
    webpack: webpackConfig,
    webpackMiddleware: {
      noInfo: true
    },
    basePath: "",
    frameworks: ["jasmine"],
    files: [
      "../client/app/**/*.tests.js"
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
