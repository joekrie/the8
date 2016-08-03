const webpack = require("webpack")

const webpackConfig = require("./webpack.config.build.js")

const config = Object.create(webpackConfig)

config.devtool = "eval"

config.plugins.push(
  new webpack.optimize.CommonsChunkPlugin("common", "common.js"),
  new webpack.HotModuleReplacementPlugin()
)

config.module.loaders.unshift(
  {
    test: /\.js(x)?$/,
    exclude: /node_modules/,
    loader: "react-hot"
  }
)

config.entry["dev-server"] = [
  "webpack-dev-server/client?http://localhost:8085",
  "webpack/hot/only-dev-server"
]

module.exports = config