const nxWebpack = require('@nrwl/react/plugins/webpack')

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
        "http"  : require.resolve("stream-http"),
        "https" : require.resolve("https-browserify"),
        "path"  : require.resolve("path-browserify"),
        "module": false,
        "fs"    : false
      },
    }
  }

  if (process.env.NODE_ENV === 'production') {
    return {
      ...webpackConfig,
      mode: 'production',
      devtool: 'source-map',
    }
  } else {
    return webpackConfig
  }
}
