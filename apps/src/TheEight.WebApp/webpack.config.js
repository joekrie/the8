const path = require("path")
const webpack = require("webpack")
const flexibility = require("postcss-flexibility")
const autoprefixer = require("autoprefixer")
const ExtractTextPlugin = require("extract-text-webpack-plugin")
const cssnext = require("postcss-cssnext")

const basePath = path.join(__dirname, "./client")

module.exports = {
  context: basePath,
  entry: {
    "app/app": ["babel-polyfill", "./app"],
    "base": "./styles/base.scss"
  },
  module: {
    loaders: [
      {
        test: /\.css$/,
        exclude: /node_modules/,
        loaders: [
          "style-loader?sourceMap",
          "css-loader?modules&importLoaders=1&localIdentName=[path]___[name]__[local]___[hash:base64:5]",
          "postcss-loader", 
          "resolve-url-loader"
        ]
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
    flexibility,
    cssnext
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
    modules: [
      basePath,
      "./node_modules"
    ],
    extensions: [
      ".js",
      ".jsx"
    ]
  },
  plugins: [
    new webpack.optimize.DedupePlugin(),
    new ExtractTextPlugin("[name].css", {
      allChunks: true
    })
  ],
  node: {
    fs: "empty"
  }
}
