const { composePlugins, withNx } = require('@nrwl/webpack')
const webpack = require('webpack')
const TerserPlugin = require("terser-webpack-plugin")
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin")
const path = require('path')

// Nx plugins for webpack.
module.exports = composePlugins(withNx(), (config) => {
  
  // add fallback for node modules
  config.resolve.fallback = {
    ...config.resolve.fallback,
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
  }


  // add externals
  config.externals = {
    ...config.externals,
    solc: 'solc',
  }

  // add public path
  config.output.publicPath = './'

  // add copy & provide plugin
  config.plugins.push(
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      url: ['url', 'URL'],
      process: 'process/browser',
    })
  )

  // set the define plugin to load the WALLET_CONNECT_PROJECT_ID
  config.plugins.push(
    new webpack.DefinePlugin({
      WALLET_CONNECT_PROJECT_ID: JSON.stringify(process.env.WALLET_CONNECT_PROJECT_ID),
    })
  )

  config.plugins.push(
    new webpack.DefinePlugin({
      'fetch': `((...args) => {
        if (args[0].origin === 'https://github.com') {
          return fetch('https://api.allorigins.win/raw?url=' + args[0])
        }
        return fetch(...args)
      })`,
    })
  )

  // source-map loader
  config.module.rules.push({
    test: /\.js$/,
    use: ["source-map-loader"],
    enforce: "pre"
  })

  config.ignoreWarnings = [/Failed to parse source map/] // ignore source-map-loader warnings


  // set minimizer
  config.optimization.minimizer = [
    new TerserPlugin({
      parallel: true,
      terserOptions: {
        ecma: 2015,
        compress: false,
        mangle: false,
        format: {
          comments: false,
        },
      },
      extractComments: false,
    }),
    new CssMinimizerPlugin(),
  ];

  config.watchOptions = {
    ignored: /node_modules/
  }

  config.experiments.syncWebAssembly = true

  config.plugins.push(
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      'process.env.REACT_APP_AZTEC_PLUGIN_API_BASE_URL_DEV':  JSON.stringify(process.env.REACT_APP_AZTEC_PLUGIN_API_BASE_URL_DEV),
      'process.env.REACT_APP_AZTEC_PLUGIN_API_BASE_URL_PROD': JSON.stringify(process.env.REACT_APP_AZTEC_PLUGIN_API_BASE_URL_PROD),
      'process.env.REACT_APP_AZTEC_PLUGIN_WS_URL_DEV':       JSON.stringify(process.env.REACT_APP_AZTEC_PLUGIN_WS_URL_DEV),
      'process.env.REACT_APP_AZTEC_PLUGIN_WS_URL_PROD':      JSON.stringify(process.env.REACT_APP_AZTEC_PLUGIN_WS_URL_PROD),
    })
  )
  
  return config;
});
