const webpack = require("webpack")
const WebpackDevServer = require("webpack-dev-server")
const path = require("path")

const config = Object.create(require("./webpack.config"))

config.devtool = "eval"

config.plugins.push(
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

const port = 8085

new WebpackDevServer(webpack(config), {
  publicPath: config.output.publicPath,
  hot: true,
  historyApiFallback: true
}).listen(port, "localhost", function (err, result) {
  if (err) {
    return console.log(err)
  }

  console.log(`Listening at http://localhost:${port}/`)
})
