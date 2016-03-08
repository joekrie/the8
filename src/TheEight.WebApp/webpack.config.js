var path = require("path");
var webpack = require("webpack");

module.exports = {
    context: path.join(__dirname, "client/app"),
    entry: {
        server: "./server",
        client: "./client"
    },
    externals: {
        react: "React"
    },
    module: {
        loaders: [
            {
                test: /\.js(x)?$/,
                exclude: /node_modules/,
                loader: "babel-loader",
                query: {
                    plugins: [
                        "transform-decorators-legacy"
                    ],
                    presets: [
                        "es2015",
                        "stage-0",
                        "react"
                    ]
                }
            }
        ]
    },
    output: {
        path: path.join(__dirname, "wwwroot/app"),
        filename: "[name].js"
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
        new webpack.optimize.UglifyJsPlugin({ minimize: true })
    ]
};