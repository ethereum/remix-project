const { composePlugins, withNx } = require('@nrwl/webpack')
const webpack = require('webpack')
const TerserPlugin = require("terser-webpack-plugin")
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin")

// Nx plugins for webpack.
module.exports = composePlugins((config) => {
  config = {}
  config.target = 'electron-main'
  config.devtool = 'source-map'
  config.mode = 'production'
  config.output = {
    path: __dirname + '/.webpack/main',
    filename: '[name].js',
  }

  config.target = 'electron-preload'

  config.entry = {
    index: ['./apps/remixdesktop/src/index.ts'],
    preload: ['./apps/remixdesktop/src/preload.ts'],
  }
  
  config.plugins= [
    new webpack.DefinePlugin({
      MAIN_WINDOW_WEBPACK_ENTRY:`\`file://$\{require('path').resolve(__dirname, '..', 'renderer', 'index.html')}\``,
      'process.env.MAIN_WINDOW_WEBPACK_ENTRY': `\`file://$\{require('path').resolve(__dirname, '..', 'renderer', 'index.html')}\``,
      MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: `\`$\{require('path').resolve(__dirname, 'preload.js')}\``,
      'process.env.MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY': `\`$\{require('path').resolve(__dirname, '..', 'render', 'preload.js')}\``,
    })
  ]
  
  config.module = {}
  config.module.rules = [
    // Add support for native node modules
    {
      // We're specifying native_modules in the test because the asset relocator loader generates a
      // "fake" .node file which is really a cjs file.
      test: /native_modules[/\\].+\.node$/,
      use: 'node-loader',
    },
    /*
    {
      test: /[/\\]node_modules[/\\].+\.(m?js|node)$/,
      parser: { amd: false },
      use: {
        loader: '@vercel/webpack-asset-relocator-loader',
        options: {
          outputAssetBase: 'native_modules',
        },
      },
    },
    */
    {
      test: /\.tsx?$/,
      exclude: /(node_modules|\.webpack)/,
      use: {
        loader: 'ts-loader',
        options: {
          transpileOnly: true,
        },
      },
    },
  ];
  config.resolve = {}
  config.resolve.extensions = [ '.js', '.ts', '.jsx', '.tsx', '.css' ]
  config.target = 'electron-preload'


  config.node = {
    __dirname: false,
    __filename: false,
  }

  console.log('config', config)
  return config;
});
