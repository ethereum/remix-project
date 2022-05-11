const nxWebpack = require('@nrwl/react/plugins/webpack')
const TerserPlugin = require('terser-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const version = require('../../package.json').version
const fs = require('fs')

const versionData = {
  version: version,
  timestamp: Date.now(),
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development'
}

fs.writeFileSync('./apps/remix-ide/src/assets/version.json', JSON.stringify(versionData))

module.exports = config => {
  const nxWebpackConfig = nxWebpack(config)
  const webpackConfig = {
    ...nxWebpackConfig,
    node: {
      fs: 'empty',
      tls: 'empty',
      readline: 'empty',
      net: 'empty',
      module: 'empty',
      child_process: 'empty'
    },
    output: {
      ...nxWebpackConfig.output,
      filename: `[name].${versionData.version}.${versionData.timestamp}.js`,
      chunkFilename: `[name].${versionData.version}.${versionData.timestamp}.js`,
    },
    plugins: [
      ...nxWebpackConfig.plugins,
      new CopyWebpackPlugin({
        patterns: [
          { from: '../../../node_modules/monaco-editor/dev/vs/', to: 'assets/js/monaco-editor/dev/vs' }
        ].filter(Boolean)
      })
    ]
  }
  
  webpackConfig.output.chunkLoadTimeout = 600000

  if (process.env.NODE_ENV === 'production') {
    return {
      ...webpackConfig,
      mode: 'production',
      devtool: 'source-map',
      optimization: {
        minimize: false,
        minimizer: [new TerserPlugin()]
      }
    }
  } else {
    return webpackConfig
  }
}
