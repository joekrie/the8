var path = require('path');

module.exports = {
    entry: './src/app/boat-lineup-planner/main',
	output: {
	    filename: './dist/app/boat-lineup-planner/main.js'
	},
	module: {
	    loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                query: {
                    optional: [
                        'runtime'
                    ],
                    stage: 0
                }
            }
		]
	},
	resolve: {
	    modulesDirectories: [
            'node_modules'
	    ]
	},
	externals: {
	    react: 'React'
	}
}