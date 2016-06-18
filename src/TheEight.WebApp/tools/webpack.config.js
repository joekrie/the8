const path = require("path");
const webpack = require("webpack");
const flexibility = require("postcss-flexibility");
const autoprefixer = require("autoprefixer");

var config = {
  context: path.join(__dirname, "../client/app"),
  entry: {
    client: "./client"
  },
  module: {
    loaders: [
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        loaders: ["style", "css", "postcss", "sass"]
      },
      {
        test: /\.js(x)?$/,
        exclude: /node_modules/,
        loader: "babel-loader"
      },
      { 
        test: /bootstrap\/dist\/js\/umd\//, 
        loader: "imports?jQuery=jquery" 
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
    path: path.join(__dirname, "../wwwroot/app"),
    filename: "[name].js",
    publicPath: "/static/"
  },
  resolve: {
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
    new webpack.ProvidePlugin({
      "fetch": "imports?this=>global!exports?global.fetch!whatwg-fetch",
      "$": "jquery",
      "jQuery": "jquery",
      "jquery": "jquery",
      "Tether": "tether",
      "window.Tether": "tether"
    })
  ]
};

if (process.env.NODE_ENV === "production") {
  config.plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      minimize: true
    })
  );
}

module.exports = config;