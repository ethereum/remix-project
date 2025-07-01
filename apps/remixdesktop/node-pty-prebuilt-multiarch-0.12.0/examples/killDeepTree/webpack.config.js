const path = require('path');

module.exports = {
	entry: './entry.js',
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, 'dist')
	},
	devServer: {
		port: 8000
	}
};
