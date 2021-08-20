const nxWebpack = require('@nrwl/react/plugins/webpack')
const TerserPlugin = require('terser-webpack-plugin')

module.exports = config => {
  const nxWebpackConfig = nxWebpack(config)
  const productionConfig = process.env.NODE_ENV === 'production' ? {
    mode: 'production',
    devtool: 'source-map',
    optimization: {
      minimize: true,
      minimizer: [new TerserPlugin()]
    }
  } : {}

  return {
    ...nxWebpackConfig,
    ...productionConfig,
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
