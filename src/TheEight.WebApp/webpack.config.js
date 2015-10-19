var path = require('path');

module.exports = {
    entry: {
        'boat-lineup-planner/client': './src/app/boat-lineup-planner/client',
        'boat-lineup-planner/server': './src/app/boat-lineup-planner/server'
    },
	output: {
	    filename: './dist/app/[name].js'
	},
	module: {
	    loaders: [
            {
                test: /\.js(x)?$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                query: {
                    optional: [
                        'runtime'
                    ],
                    stage: 0
                }
            },
            {
                test: /\.scss$./,
                exclude: /node_modules/,
                loaders: ['style', 'css', 'sass']
            },
            {
                test: /\.css$./,
                exclude: /node_modules/,
                loaders: ['style', 'css']
            }
		]
	},
	resolve: {
	    modulesDirectories: [
            'node_modules'
	    ],
	    extensions: ['', '.js', '.jsx']
	},
	externals: {
	    react: 'React'
	}
}