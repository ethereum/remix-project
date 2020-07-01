const babelWebpack = require('@nrwl/react/plugins/webpack')
const nodeExternals = require('webpack-node-externals')

module.exports = config => {
    const babelWebpackConfig = babelWebpack(config)
    const { entry, devtool, mode, output, module, resolve, performance, plugins, watch } = babelWebpackConfig

    console.log('babelWebpackConfig: ', Object.keys(babelWebpackConfig))

    return {
        ...babelWebpackConfig,
        module: {
            rules: [
                {
                    test: /\.m?js$/,
                    exclude: /(node_modules|bower_components)/,
                    loader: 'babel-loader'
                }
            ]
        },
        target: 'node',
        externals: [nodeExternals({
            modulesFromFile: true
        })]
    }
}
