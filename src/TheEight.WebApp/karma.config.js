// http://kentor.me/posts/testing-react-and-flux-applications-with-karma-and-webpack/

module.exports = function (config) {
    config.set({
        browsers: [
            'PhantomJS'
        ],
        files: [
            {
                pattern: 'tests.webpack.js',
                watched: false
            }
        ],
        frameworks: [
            'jasmine'
        ],
        preprocessors: {
            'tests.webpack.js': [
                'webpack'
            ]
        },
        reporters: [
            'dots'
        ],
        singleRun: true,
        webpack: {
            module: {
                loaders: [
                    {
                        test: /\.jsx?$/,
                        exclude: /node_modules/,
                        loader: 'babel-loader'
                    }
                ]
            },
            watch: true
        },
        webpackServer: {
            noInfo: true
        }
    });
};