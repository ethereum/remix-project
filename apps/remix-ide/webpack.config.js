const nxWebpack = require('@nrwl/react/plugins/webpack')

module.exports = config => {
    const nxWebpackConfig = nxWebpack(config)
    const { module, module: { rules } } = nxWebpackConfig

    return {
        ...nxWebpackConfig,
        module: {
            ...module,
            rules: [
                ...rules,
                {
                    test: /\.compiler\.js$/,
                    use: { loader: 'worker-loader' }
                }
            ]
        },
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
