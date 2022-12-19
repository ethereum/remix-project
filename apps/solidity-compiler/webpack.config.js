const nxWebpack = require('@nrwl/react/plugins/webpack')
const webpack = require('webpack')

module.exports = config => {
  const nxWebpackConfig = nxWebpack(config)
  const webpackConfig = {
    ...nxWebpackConfig,
    resolve: {
      ...nxWebpackConfig.resolve,
      fallback: {
        ...nxWebpackConfig.resolve.fallback,
        "crypto": require.resolve("crypto-browserify"),
        "stream": require.resolve("stream-browserify"),
        "path": require.resolve("path-browserify"),
        "http": require.resolve("stream-http"),
        "https": require.resolve("https-browserify"),
        "zlib": require.resolve("browserify-zlib"),
        "fs": false,
        "module": false,
        "tls": false,
        "net": false,
        "readline": false,
        "child_process": false,
        "buffer": require.resolve("buffer/"),
      },
    },
    plugins: [
      ...nxWebpackConfig.plugins,
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
      }),
    ],
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
