const webpack = require("webpack")
const WebpackDevServer = require("webpack-dev-server")

const config = require("./webpack.config.dev")

const port = 8085

new WebpackDevServer(webpack(config), {
  publicPath: config.output.publicPath,
  hot: true,
  historyApiFallback: true,
  quiet: true
}).listen(port, "localhost", function (err, result) {
  if (err) {
    return console.log(err)
  }

  console.log(`Listening at http://localhost:${port}/`)
})
