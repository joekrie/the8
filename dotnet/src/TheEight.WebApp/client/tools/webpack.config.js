const path = require("path")
const webpack = require("webpack")
const flexibility = require("postcss-flexibility")
const autoprefixer = require("autoprefixer")
const ExtractTextPlugin = require("extract-text-webpack-plugin")

module.exports = {
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
        test: /\.js(x)?$/,
        exclude: /node_modules/,
        loader: "babel",
        query: {
          plugins: [
            "transform-decorators-legacy",
            "transform-regenerator",
            [
              "transform-runtime",
              {
                polyfill: false,
                regenerator: true
              }
            ]
          ],
          presets: [
            "es2015-loose",
            "es2015",
            "stage-0",
            "react"
          ]
        }
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
    env: {
      browser: true
    },
    parser: "babel-eslint",
    extends: "eslint:recommended",
    parserOptions: {
      ecmaVersion: 7,
      sourceType: "module",
      ecmaFeatures: {
        experimentalObjectRestSpread: true,
        jsx: true
      }
    },
    plugins: [
      "react"
    ],
    rules: {
      "indent": ["error", 2],
      "linebreak-style": ["error", "windows"],
      "quotes": ["error", "double"],
      "semi": ["error", "never"]
    },
    emitError: true,
    emitWarning: true
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
      "$": "jquery",  // todo: has Bootstrap been refactored to classes/components?
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
