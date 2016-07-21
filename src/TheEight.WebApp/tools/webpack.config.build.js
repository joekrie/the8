const webpack = require("webpack")

const webpackConfig = require("./webpack.config.common.js")

var config = Object.create(webpackConfig)

config.plugins.push(
  new webpack.optimize.CommonsChunkPlugin("common", "common.js")
)

module.exports = config
