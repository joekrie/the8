const webpack = require("webpack")

const webpackConfig = require("./webpack.config.build.js")

var config = Object.create(webpackConfig)

config.plugins.push(
  new webpack.HotModuleReplacementPlugin(),
  new webpack.optimize.UglifyJsPlugin({
    minimize: true
  })
)

module.exports = config
