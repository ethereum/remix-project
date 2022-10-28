const nxWebpack = require('@nrwl/react/plugins/webpack')
const TerserPlugin = require('terser-webpack-plugin')

module.exports = config => {
  const nxWebpackConfig = nxWebpack(config)
  const webpackConfig = {
    ...nxWebpackConfig,
    resolve   : {
      ...nxWebpackConfig.resolve,
      fallback: {
        ...nxWebpackConfig.resolve.fallback,
        "crypto": require.resolve("crypto-browserify"),
        "stream": require.resolve("stream-browserify"),
        "path": require.resolve("path-browserify"),
        "http": require.resolve("stream-http"),
        "https": require.resolve("https-browserify"),
        "fs": false,
        "module": false,
        "tls": false,
        "net": false,
        "readline": false,
        "child_process": false,
      },
    }
  }

  if (process.env.NODE_ENV === 'production') {
    return {
      ...webpackConfig,
      mode: 'production',
      devtool: 'source-map',
      optimization: {
        minimize: true,
        minimizer: [new TerserPlugin()]
      }
    }
  } else {
    return webpackConfig
  }
}
