const nodeExternals = require('webpack-node-externals')
const webpackConfig = require('@nrwl/react/plugins/webpack')
const path = require('path')

module.exports = (config) => {
    return {
        ...webpackConfig(config),
        target: 'node', // in order to ignore built-in modules like path, fs, etc. 
        externals: [nodeExternals()], // in order to ignore all modules in node_modules folder
        resolve: {
            extensions: ['.js', '.ts', '.json'],
            alias: {
                'remix-analyzer': path.resolve(__dirname, '../../libs/remix-analyzer/index.ts'),
                'remix-astwalker': path.resolve(__dirname, '../../libs/remix-astwalker/src/index.ts'),
                'remix-debug': path.resolve(__dirname, '../../libs/remix-debug/index.js'),
                'remix-lib': path.resolve(__dirname, '../../libs/remix-lib/index.js'),
                'remix-simulator': path.resolve(__dirname, '../../libs/remix-simulator/index.js'),
                'remix-solidity': path.resolve(__dirname, '../../libs/remix-solidity/index.ts'),
                'remix-tests': path.resolve(__dirname, '../../libs/remix-tests/src/index.ts'),
                'remix-url-resolver': path.resolve(__dirname, '../../libs/remix-url-resolver/src/index.ts')
            }
        }
    }
}