const path = require("path");
const webpack = require("webpack");

var config = {
  context: path.join(__dirname, "client/app"),
  entry: {
    client: "./client"
  },
  module: {
    loaders: [
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