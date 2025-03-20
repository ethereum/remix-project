const { composePlugins, withNx } = require('@nx/webpack');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');

module.exports = composePlugins(withNx(), (config) => {
  // Add fallback for node modules
  config.resolve.fallback = {
    ...config.resolve.fallback,
    crypto: require.resolve('crypto-browserify'),
    stream: require.resolve('stream-browserify'),
    path: require.resolve('path-browserify'),
    http: require.resolve('stream-http'),
    https: require.resolve('https-browserify'),
    constants: require.resolve('constants-browserify'),
    zlib: require.resolve('browserify-zlib'),
    buffer: require.resolve('buffer/'),
    vm: require.resolve('vm-browserify'),
    os: false,
    timers: false,
    fs: false,
    module: false,
    tls: false,
    net: false,
    readline: false,
    child_process: false,
    tty: false,
    worker_threads: false,  // Explicitly ignore worker_threads
  };

  // Add externals
  config.externals = { ...config.externals, solc: 'solc' };

  // Set public path
  config.output.publicPath = './';

  // Add ProvidePlugin for global variables
  config.plugins.push(
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      url: ['url', 'URL'],
      process: 'process/browser',
    })
  );

  // Define WALLET_CONNECT_PROJECT_ID
  config.plugins.push(
    new webpack.DefinePlugin({
      WALLET_CONNECT_PROJECT_ID: JSON.stringify(process.env.WALLET_CONNECT_PROJECT_ID),
    })
  );

  // Fix Webpack Manifest Plugin issue by ensuring it uses compiler hooks properly
  config.plugins.push(
    new WebpackManifestPlugin({
      fileName: 'manifest.json',
      publicPath: '/',
      generate: (seed, files) =>
        files.reduce((manifest, { name, path }) => {
          manifest[name] = path;
          return manifest;
        }, seed),
      filter: (file) => !file.path.includes('assets') && !file.path.includes('.map'),
    })
  );

  // Add source-map loader
  config.module.rules.push({
    test: /\.js$/,
    use: ['source-map-loader'],
    enforce: 'pre',
  });

  config.ignoreWarnings = [/Failed to parse source map/]; // Ignore source-map-loader warnings

  // Set CSS module rules handler
  config.module.rules.push({
    test: /\.css$/,
    use: [
      'style-loader',
      {
        loader: 'css-loader',
        options: {
          modules: {
            auto: true, // Enables CSS modules automatically for `.module.css` files
            localIdentName: '[name]__[local]--[hash:base64:5]', // Scoped class names
          },
          importLoaders: 1,
        },
      },
      'postcss-loader',
    ],
  });

  // Set minimizer
  config.optimization.minimizer = [
    new TerserPlugin({
      parallel: true,
      terserOptions: {
        ecma: 2015,
        compress: false,
        mangle: false,
        format: { comments: false },
      },
      extractComments: false,
    }),
    new CssMinimizerPlugin(),
  ];

  config.watchOptions = { ignored: /node_modules/ };

  config.experiments.syncWebAssembly = true;

  return config;
});