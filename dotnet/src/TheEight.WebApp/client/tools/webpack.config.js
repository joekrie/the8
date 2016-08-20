const path = require("path")
const webpack = require("webpack")
const flexibility = require("postcss-flexibility")
const autoprefixer = require("autoprefixer")
const ExtractTextPlugin = require("extract-text-webpack-plugin")

const config = {
  context: path.join(__dirname, "../src"),
  entry: {
    "index": "./index"
  },
  module: {
    loaders: [
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        loader: ExtractTextPlugin.extract("style", ["css", "postcss", "resolve-url", "sass"])
      },
      {
        test: /\.js?$/,
        exclude: /node_modules/,
        loaders: ["babel", "eslint"]
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
      browsers: ["last 3 versions"]
    }),
    flexibility
  ],
  eslint: {
    configFile: path.join(__dirname, ".eslintrc.js"),
    emitError: true,
    emitWarning: true,
    //failOnError: true
  },
  resolve: {
    root: [
      path.join(__dirname, "../src")
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
  plugins: [
    new webpack.optimize.DedupePlugin(),
    new webpack.ProvidePlugin({
      "fetch": "imports?this=>global!exports?global.fetch!whatwg-fetch",  // todo: is this still necessary?
      "$": "jquery",  // todo: has Bootstrap been refactored to classes?
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
