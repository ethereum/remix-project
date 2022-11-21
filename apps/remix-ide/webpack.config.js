const nxWebpack = require('@nrwl/react/plugins/webpack')
const CopyPlugin = require("copy-webpack-plugin");
const webpack = require('webpack')
const version = require('../../package.json').version
const fs = require('fs')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

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
    resolve: {
      ...nxWebpackConfig.resolve,
      fallback: {
        ...nxWebpackConfig.resolve.fallback,
        "crypto": require.resolve("crypto-browserify"),
        "stream": require.resolve("stream-browserify"),
        "path": require.resolve("path-browserify"),
        "http": require.resolve("stream-http"),
        "https": require.resolve("https-browserify"),
        "constants": require.resolve("constants-browserify"),
        "os": false, //require.resolve("os-browserify/browser"),
        "timers": false, // require.resolve("timers-browserify"),
        "zlib": require.resolve("browserify-zlib"),
        "fs": false,
        "module": false,
        "tls": false,
        "net": false,
        "readline": false,
        "child_process": false,
        "buffer": require.resolve("buffer/"),
        "vm": require.resolve('vm-browserify'),
      },
    },
    externals: {
      ...nxWebpackConfig.externals,
      solc: 'solc',
    },

    output: {
      ...nxWebpackConfig.output,
      filename: `[name].${versionData.version}.${versionData.timestamp}.js`,
      chunkFilename: `[name].${versionData.version}.${versionData.timestamp}.js`,
    },
    plugins: [
      ...nxWebpackConfig.plugins,
      //new BundleAnalyzerPlugin({
      //  analyzerMode: 'static'
      //}),
      new CopyPlugin({
        patterns: [
          { from: '../../node_modules/monaco-editor/dev/vs', to: 'assets/js/monaco-editor/dev/vs' }
        ].filter(Boolean)
      }),
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
        url: ['url', 'URL'],
        process: 'process/browser',
      }),
    ]
  }

  webpackConfig.output.chunkLoadTimeout = 600000

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
