const path = require("path")
const webpack = require("webpack")
const flexibility = require("postcss-flexibility")
const autoprefixer = require("autoprefixer")
const ExtractTextPlugin = require("extract-text-webpack-plugin")

module.exports = {
  context: path.join(__dirname, "../src"),
  entry: {
    "app/app": ["babel-polyfill", "./app"],
    "base": "./styles/base.scss"
  },
  module: {
    loaders: [
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        loader: ExtractTextPlugin.extract("style", ["css?modules&camelCase", "postcss", "resolve-url", "sass?sourceMap"])
      },
      {
        test: /\.js(x)?$/,
        exclude: /node_modules/,
        loader: "babel",
        query: {
          plugins: [
            "transform-decorators-legacy",
            [
              "transform-runtime",
              {
                polyfill: true,
                regenerator: true
              }
            ]
          ],
          presets: ["es2015-loose", "es2015", "stage-0", "react"]
        }
      },
      { 
        test: /\.svg$/,
        loader: "file?name=img/[name]-[hash].[ext]"
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
      "../../node_modules"
    ],
    extensions: [
      "",
      ".js",
      ".jsx"
    ]
  },
  plugins: [
    new webpack.optimize.DedupePlugin(),
    new ExtractTextPlugin("[name].css", {
      allChunks: true
    })
  ]
}
