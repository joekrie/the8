const webpack = require("webpack")
const ExtractTextPlugin = require("extract-text-webpack-plugin")

const webpackConfig = require("./webpack-base.config.js")

var config = Object.create(webpackConfig)

config.plugins.push(
  new webpack.optimize.CommonsChunkPlugin("common", "common.js")
)

module.exports = config