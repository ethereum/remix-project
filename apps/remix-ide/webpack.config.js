const nxWebpack = require('@nrwl/react/plugins/webpack')
const webpack = require('webpack')
const CopyPlugin = require("copy-webpack-plugin")
const version = require('../../package.json').version
const fs = require('fs')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const TerserPlugin = require("terser-webpack-plugin")


const versionData = {
  version: version,
  timestamp: Date.now(),
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development'
}

fs.writeFileSync('./apps/remix-ide/src/assets/version.json', JSON.stringify(versionData))

module.exports = config => {
  console.log("GET WEBPACK CONFIG")
  const nxWebpackConfig = nxWebpack(config)
  // remove mini-css-extract-plugin injected by nx
  nxWebpackConfig.plugins = nxWebpackConfig.plugins.filter(plugin => {
    return plugin.constructor.name !== 'MiniCssExtractPlugin'
  })
  
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
      publicPath: '/',
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
          { from: '../../node_modules/monaco-editor/dev/vs', to: 'assets/js/monaco-editor/dev/vs' },
        ].filter(Boolean)
      }),
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
        url: ['url', 'URL'],
        process: 'process/browser',
      }),
      // new HtmlWebpackPlugin({
      //   template: 'src/index.html',
      //   filename: 'index.html',
      //   minify: false,
      // }),
      // new HtmlWebpackSkipAssetsPlugin({
      //   // exclude all javascript files
      //   skipAssets: [/.*\.js/],
      // })
    ]
  }
  webpackConfig.ignoreWarnings = [/Failed to parse source map/] // ignore source-map-loader warnings
  webpackConfig.output.chunkLoadTimeout = 600000

  console.log('process.env.NODE_ENV', process.env.NODE_ENV)
  if (process.env.NODE_ENV === 'production') {

    const config = {
      ...webpackConfig,
      mode: 'production',
      devtool: 'source-map',
      optimization: {
        minimize: false,
        mangleExports: false,
      },
    }
    console.log('config', config.plugins)
    return config
  } else {
    console.log('config dev')
    return webpackConfig
  }
}