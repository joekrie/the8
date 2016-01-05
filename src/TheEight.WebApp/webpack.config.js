var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    context: path.join(__dirname, 'client/app'),
    entry: {
        server: './server',
        client: './client'
    },
    externals: {
        react: 'React'
    },
    
    module: {
        loaders: [
            {
                test: /\.scss$/,
                exclude: /node_modules/,
                loader: ExtractTextPlugin.extract('css!sass')
            },
            {
                test: /\.js(x)?$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                query: {
                    plugins: [
                        'transform-decorators-legacy'
                    ],
                    presets: [
                        'es2015',
                        'stage-0',
                        'react'
                    ]
                }
            }
        ]
    },
    output: {
        path: path.join(__dirname, 'wwwroot/app'),
        filename: '[name].js'
    },
    plugins: [
        new ExtractTextPlugin('wwwroot/styles/app.css', { allChunks: true })
    ],
    resolve: {
        modulesDirectories: [
            'node_modules'
        ],
        extensions: ['', '.js', '.jsx']
    }
};