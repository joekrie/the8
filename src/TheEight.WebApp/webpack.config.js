const path = require("path");
const webpack = require("webpack");

var config = {
  context: path.join(__dirname, "client/app"),
  entry: {
    client: "./client",
    server: "./server"
  },
  module: {
    loaders: [
      {
        test: /\.js(x)?$/,
        exclude: /node_modules/,
        loader: "babel-loader"
      }
    ]
  },
  output: {
    path: path.join(__dirname, "wwwroot/app"),
    filename: "[name].js",
    publicPath: "/static/"
  },
  resolve: {
    modulesDirectories: [
      "node_modules"
    ],
    extensions: [
      "",
      ".js",
      ".jsx"
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
      "fetch": "imports?this=>global!exports?global.fetch!whatwg-fetch"
    }),
    //new webpack.optimize.CommonsChunkPlugin("common", "common.js")
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