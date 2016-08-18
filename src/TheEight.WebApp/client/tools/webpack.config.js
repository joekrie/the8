const webpack = require("webpack")
const path = require("path")

const webpackConfig = require(`./webpack.config.base.js`)

const config = Object.create(webpackConfig)

config.plugins.push(
  new webpack.optimize.CommonsChunkPlugin("common", "common.js")
)

if (process.env.BUILD_DEFINITIONNAME) {  // if VSTS build
  config.plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      minimize: true
    })
  )
}

config.output = {
  path: path.join(__dirname, "../dist"),
  filename: "[name].js",
  publicPath: "/static/"
}

module.exports = config
