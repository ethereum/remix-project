const nxWebpack = require('@nrwl/react/plugins/webpack')
const TerserPlugin = require('terser-webpack-plugin')
const CopyWebpackPlugin = require("copy-webpack-plugin");


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
    plugins: [
      ...nxWebpackConfig.plugins,
      new CopyWebpackPlugin({
        patterns: [
          { from: "../../../node_modules/monaco-editor/dev/vs/", to: "assets/js/monaco-editor/dev/vs" },
        ].filter(Boolean)
      })
    ]
  }

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
