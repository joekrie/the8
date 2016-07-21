const path = require("path")
const webpack = require("webpack")
const flexibility = require("postcss-flexibility")
const autoprefixer = require("autoprefixer")
const ExtractTextPlugin = require("extract-text-webpack-plugin")

var config = {
  context: path.join(__dirname, "../client"),
  entry: {
    "app/boat-lineup-planner": "expose?BoatLineupPlanner!./app/boat-lineup-planner",
    "common": "./common"
  },
  module: {
    loaders: [
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        loader: ExtractTextPlugin.extract("style", ["css", "postcss", "resolve-url", "sass"])
      },
      {
        test: /\.js(x)?$/,
        exclude: /node_modules/,
        loader: "babel"
      },
      { 
        test: /bootstrap\/dist\/js\/umd\//, 
        loader: "imports?jQuery=jquery" 
      },    
      { 
        test: /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9=&.]+)?$/,
        loader: "file?name=fonts/[name]-[hash].[ext]"
      }
    ]
  },
  postcss: [ 
    autoprefixer({
      browsers: ["last 2 versions"]
    }),
    flexibility
  ],
  output: {
    path: path.join(__dirname, "../wwwroot"),
    filename: "[name].js",
    publicPath: "/static/"
  },
  resolve: {
    root: [
      path.join(__dirname, "../client/app"),
      path.join(__dirname, "../client/styles")
    ],
    modulesDirectories: [
      "../node_modules"
    ],
    extensions: [
      "",
      ".js",
      ".jsx"
    ]
  },
  devtool: "source-map",
  plugins: [
    new webpack.optimize.DedupePlugin(),
    new webpack.ProvidePlugin({
      "fetch": "imports?this=>global!exports?global.fetch!whatwg-fetch",
      "$": "jquery",
      "jQuery": "jquery",
      "jquery": "jquery",
      "Tether": "tether",
      "window.Tether": "tether"
    }),
    new ExtractTextPlugin("[name].css", {
      allChunks: true
    })
  ]
}

module.exports = config
