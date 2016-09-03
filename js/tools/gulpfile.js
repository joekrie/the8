const gulp = require("gulp")
const webpack = require("webpack")
const path = require("path")
const gutil = require("gulp-util")
const WebpackDevServer = require("webpack-dev-server")
const rimraf = require("rimraf")
const opn = require("opn")
const KarmaServer = require("karma").Server

const webpackConfig = require("./webpack.config.js")
const distPath = path.join(__dirname, "../../dotnet/src/TheEight.WebApp/wwwroot/app")

gulp.task("default", ["test", "lint", "build"])

gulp.task("test", done => {
  new KarmaServer({
    configFile,
    singleRun: true,
    browsers,
    reporters: ["spec"]
  }, done).start()
})

gulp.task("test:ci", done => {
  new KarmaServer({
    configFile,
    browsers: ["PhantomJS"],
    reporters: ["spec", "junit"],
    junitReporter: {
      outputDir: "./test-results"
    },
  }, done).start()
})

gulp.task("test:watch", done => {
  new KarmaServer({
    configFile,
    browsers
  }, done).start()
})

gulp.task("clean:test", done => {
  rimraf("./test-results", done)
})

function getConfig() {
  const config = Object.create(webpackConfig)

  config.output = {
    path: distPath,
    filename: "[name].js"
  }

  return config
}

gulp.task("build", ["clean:build"], done => {
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

gulp.task("build:ci", ["clean:build"], done => {
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
      opn(`http://localhost:${port}/dev-server.html`).then(done)
    })
})

gulp.task("clean:build", done => {
  rimraf(distPath, done)
})
