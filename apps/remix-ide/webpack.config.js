const nodeExternals = require('webpack-node-externals')
const webpackConfig = require('@nrwl/react/plugins/webpack')
const path = require('path')

module.exports = (config) => {
    return {
        ...webpackConfig(config),
        entry: path.resolve(__dirname, './src/app.js'), //webpack entry file
        module: {
            rules: [
                {
                    test: /\.ts?$/,
                    exclude: [/node_modules/],
                    loader: "ts-loader"
                }
            ]
        },
        target: 'node', // in order to ignore built-in modules like path, fs, etc. 
        externals: [nodeExternals()], // in order to ignore all modules in node_modules folder
        resolve: {
            extensions: ['.js', '.ts', '.json'],
            alias: {
                '@remix-project/remix-analyzer': path.resolve(__dirname, '../../libs/remix-analyzer/index.ts'),
                '@remix-project/remix-astwalker': path.resolve(__dirname, '../../libs/remix-astwalker/src/index.ts'),
                '@remix-project/remix-debug': path.resolve(__dirname, '../../libs/remix-debug/index.js'),
                '@remix-project/remix-lib': path.resolve(__dirname, '../../libs/remix-lib/index.js'),
                '@remix-project/remix-simulator': path.resolve(__dirname, '../../libs/remix-simulator/index.js'),
                '@remix-project/remix-solidity': path.resolve(__dirname, '../../libs/remix-solidity/index.ts'),
                '@remix-project/remix-tests': path.resolve(__dirname, '../../libs/remix-tests/src/index.ts'),
                '@remix-project/remix-url-resolver': path.resolve(__dirname, '../../libs/remix-url-resolver/src/index.ts')
            }
        }
    }
}