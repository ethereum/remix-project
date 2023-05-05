const { composePlugins, withNx } = require('@nrwl/webpack')
const { withReact } = require('@nrwl/react')
const webpack = require('webpack')
const CopyPlugin = require("copy-webpack-plugin")
const version = require('../../package.json').version
const fs = require('fs')
const TerserPlugin = require("terser-webpack-plugin")
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin")
const axios = require('axios')

const versionData = {
  version: version,
  timestamp: Date.now(),
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development'
}

const loadLocalSolJson = async () => {
  // execute apps/remix-ide/ci/downloadsoljson.sh
  const child = require('child_process').execSync('bash ./apps/remix-ide/ci/downloadsoljson.sh', { encoding: 'utf8', cwd: process.cwd(), shell: true })
  // show output
  console.log(child)
}

fs.writeFileSync('./apps/remix-ide/src/assets/version.json', JSON.stringify(versionData))

loadLocalSolJson()

const project = fs.readFileSync('./apps/remix-ide/project.json', 'utf8')

const implicitDependencies = JSON.parse(project).implicitDependencies

const copyPatterns = implicitDependencies.map((dep) => {
  try {
    fs.statSync(__dirname + `/../../dist/apps/${dep}`).isDirectory()
    return { from: `../../dist/apps/${dep}`, to: `plugins/${dep}` }
  }
  catch (e) {
    console.log('error', e)
    return false
  }
})

console.log('Copying plugins... ', copyPatterns)

// Nx plugins for webpack.
module.exports = composePlugins(withNx(), withReact(), (config) => {
  // Update the webpack config as needed here.
  // e.g. `config.plugins.push(new MyPlugin())`

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
  config.output.publicPath = '/'

  // set filename
  config.output.filename = `[name].${versionData.version}.${versionData.timestamp}.js`
  config.output.chunkFilename = `[name].${versionData.version}.${versionData.timestamp}.js`

  // add copy & provide plugin
  config.plugins.push(
    new CopyPlugin({
      patterns: [
        { from: '../../node_modules/monaco-editor/min/vs', to: 'assets/js/monaco-editor/min/vs' },
        ...copyPatterns
      ].filter(Boolean)
    }),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      url: ['url', 'URL'],
      process: 'process/browser',
    })
  )

  // souce-map loader
  config.module.rules.push({
    test: /\.js$/,
    use: ["source-map-loader"],
    enforce: "pre"
  })

  config.ignoreWarnings = [/Failed to parse source map/, /require function/] // ignore source-map-loader warnings & AST warnings

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

  return config;
});


