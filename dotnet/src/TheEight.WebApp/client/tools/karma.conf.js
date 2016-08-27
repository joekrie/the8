const webpackConfig = require("./webpack.config.js")

const testsGlob = "../src/app/**/records/__tests__/**/*.tests.js"

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
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    concurrency: Infinity
  })
}
