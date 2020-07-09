const nxWebpack = require('@nrwl/react/plugins/webpack')
const path = require('path')
const webpack = require('webpack')

module.exports = config => {
    const nxWebpackConfig = nxWebpack(config)
    const { module, module: { rules }, plugins } = nxWebpackConfig

    return {
        ...nxWebpackConfig,
        node: {
            fs: 'empty',
            tls: 'empty',
            readline: 'empty',
            net: 'empty',
            module: 'empty',
            child_process: 'empty'
        }
    }
}
