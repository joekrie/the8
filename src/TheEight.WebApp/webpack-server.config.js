var webpack = require('webpack');
var baseConfig = require('./webpack-base.config.js');

var config = Object.create(baseConfig);

config.entry = './client/app/server.js';

config.output = {
    filename: './wwwroot/app/server.js'
};

module.exports = config;