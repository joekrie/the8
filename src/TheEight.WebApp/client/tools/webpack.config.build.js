const webpack = require("webpack")

// todo: import based on ENV (prod or dev)
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
