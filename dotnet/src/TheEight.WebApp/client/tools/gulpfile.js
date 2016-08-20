const gulp = require("gulp")
const Server = require("karma").Server
const webpack = require("webpack")
const path = require("path")
const gutil = require("gulp-util")
const eslint = require("gulp-eslint")

const webpackConfig = require("./webpack.config.js")
const eslintConfig = require("./.eslintrd.js")

gulp.task("default", ["test", "lint", "build"])

gulp.task("build", done => {
  const config = Object.create(webpackConfig)

  config.plugins.push(
    new webpack.optimize.CommonsChunkPlugin("common", "common.js"),
    new webpack.optimize.UglifyJsPlugin({ minimize: true })
  )

  config.output = {
    path: path.join(__dirname, "../dist"),
    filename: "[name].js",
    publicPath: "/static/"
  }

  webpack(config, (err, stats) => {
    if (err) {
      throw new gutil.PluginError("webpack", err)
    }

    done()
  })
})

gulp.task("build:watch", done => {
  const config = Object.create(webpackConfig)

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

  const compiler = webpack(config)
  const port = 8085

  new WebpackDevServer(compiler, {
    publicPath: config.output.publicPath,
    hot: true,
    historyApiFallback: true
  }).listen(port, "localhost", (err, result) => {
    if (err) {
      throw new gutil.PluginError("webpack", err)
    }

    gutil.log("[webpack-dev-server]", `Listening at http://localhost:${port}/`)
    done()
  })
})

gulp.task("test", done => {
  new Server({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, done).start()
})

gulp.task("test:watch", done => {
  new Server({
    configFile: path.join(__dirname, "/karma.conf.js")
  }, done).start()
})

gulp.task("lint", () => {
  return gulp
    .src("../src/**")
    .pipe(eslint(eslintConfig))
    .pipe(eslint.format())
    .pipe(eslint.failOnError())
})
