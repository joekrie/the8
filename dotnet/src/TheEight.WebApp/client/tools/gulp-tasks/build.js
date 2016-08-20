const gulp = require("gulp")
const webpack = require("webpack")
const path = require("path")
const gutil = require("gulp-util")
const WebpackDevServer = require("webpack-dev-server")
const rimraf = require("rimraf")

const webpackConfig = require("../webpack.config.js")

function getConfig() {
  const config = Object.create(webpackConfig)

  config.output = {
    path: path.join(__dirname, "../../dist/app"),
    filename: "[name].js"
  }

  return config
}

gulp.task("build", done => {
  const config = getConfig()

  config.devtool = "source-map",

  webpack(config, (err, stats) => {
    if (err) {
      throw new gutil.PluginError("webpack", err)
    }

    gutil.log("[webpack]", stats.toString())
    done()
  })
})

gulp.task("build:ci", done => {
  const config = getConfig()

  config.plugins.push(
    new webpack.optimize.UglifyJsPlugin({ minimize: true }),
    new webpack.NoErrorsPlugin()
  )

  webpack(config, (err, stats) => {
    if (err) {
      throw new gutil.PluginError("webpack", err)
    }

    gutil.log("[webpack]", stats.toString())
    done()
  })
})

gulp.task("build:watch", done => {
  const config = getConfig()

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

  const compiler = webpack(config)
  const port = 8085

  const devServerConfig = {
    publicPath: "/static/",
    hot: true,
    historyApiFallback: true
  }

  new WebpackDevServer(compiler, devServerConfig)
    .listen(port, "localhost", (err, result) => {
      if (err) {
        throw new gutil.PluginError("webpack", err)
      }

      gutil.log("[webpack-dev-server]", `Listening at http://localhost:${port}/`)
      done()
    })
})

gulp.task("clean:build", () => {
  rimraf("../../dist/app/**")
})
