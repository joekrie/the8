const webpack = require("webpack")

const webpackConfig = require("./webpack.config.common.js")

const config = Object.create(webpackConfig)

config.plugins.push(
  new webpack.optimize.CommonsChunkPlugin("common", "common.js")
)

config.output = {
  path: path.join(__dirname, "../dist"),
  filename: "[name].js",
  publicPath: "/static/"
}

module.exports = config
