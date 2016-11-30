/// <binding BeforeBuild='build' Clean='clean' />

const gulp = require("gulp")
const webpack = require("webpack")
const path = require("path")
const gutil = require("gulp-util")
const WebpackDevServer = require("webpack-dev-server")
const rimraf = require("rimraf")
const opn = require("opn")
const KarmaServer = require("karma").Server
const argv = require("yargs").argv

const webpackConfig = require("./webpack.config.js")
const distPath = path.join(__dirname, "./wwwroot")

gulp.task("test", done => {
  new KarmaServer({
    configFile,
    singleRun: true,
    browsers: ["PhantomJS"],
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
    browsers: ["PhantomJS"]
  }, done).start()
})

gulp.task("test:cleanup", done => {
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

gulp.task("build", ["clean"], done => {
  const config = getConfig()
  config.devtool = "source-map"

  webpack(config, (err, stats) => {
    if (err) {
      throw new gutil.PluginError("webpack", err)
    }

    gutil.log("[webpack]", stats.toString())
    done()
  })
})

gulp.task("build:ci", ["clean"], done => {
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

  const port = 8085

  config.entry["dev-server"] = [
    `webpack-dev-server/client?http://localhost:${port}`,
    "webpack/hot/only-dev-server"
  ]

  new WebpackDevServer(webpack(config), {
    publicPath: `http://localhost:${port}/`,
    hot: true,
    historyApiFallback: true
  }).listen(port, "localhost", (err, result) => {
    if (err) {
      throw new gutil.PluginError("webpack", err)
    }

    gutil.log("[webpack-dev-server]", `Listening at http://localhost:${port}/`)

    if (argv.browser) {
      opn(`http://localhost:${port}/dev-server.html`, {
        app: ["chrome"]
      }).then(done)
    }
  })
})

gulp.task("copy", () => {
  gulp.src("../dist")
    .pipe(gulp.dest(distPath))
})

gulp.task("clean", done => {
  rimraf(distPath, done)
})
