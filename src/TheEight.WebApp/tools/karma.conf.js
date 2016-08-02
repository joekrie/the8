const webpackConfig = require("./webpack.config.common.js")

module.exports = function (config) {
  config.set({
    preprocessors: {
      "../client/app/**/*.tests.js": ["webpack"]
    },
    webpack: webpackConfig,
    webpackMiddleware: {
      noInfo: true
    },
    basePath: "",
    frameworks: ["jasmine"],
    files: [
      "../client/app/**/records/*.tests.js"
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
