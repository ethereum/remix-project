const { composePlugins, withNx } = require('@nx/webpack');
const { withReact } = require('@nx/react');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const { readFileSync, writeFileSync, readdirSync, copyFileSync } = require('fs');
const { execSync } = require('child_process');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const path = require('path');
const fs = require('fs');
const version = JSON.parse(readFileSync(path.join(__dirname, '../../package.json'), 'utf8')).version;

const versionData = {
  version: version,
  timestamp: Date.now(),
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development'
};

const loadLocalSolJson = async () => {
  console.log('loading local soljson');
  const child = execSync(`bash ${path.join(__dirname, 'ci/downloadsoljson.sh')}`, { encoding: 'utf8', cwd: process.cwd(), shell: true });
  console.log(child);
};

writeFileSync(path.join(__dirname, 'src/assets/version.json'), JSON.stringify(versionData));

loadLocalSolJson();

const project = fs.readFileSync(__dirname + '/project.json', 'utf8')

const implicitDependencies = JSON.parse(project).targets.build.dependsOn[0].projects

const copyPatterns = implicitDependencies.map((dep) => {
  try {
    // check if the directory exists
    if(fs.existsSync(__dirname + `/../../dist/apps/${dep}`) && !fs.statSync(__dirname + `/../../dist/apps/${dep}`).isDirectory()) return false
    fs.statSync(__dirname + `/../../dist/apps/${dep}`).isDirectory()
    return { from: __dirname + `/../../dist/apps/${dep}`, to: `plugins/${dep}` }
  }
  catch (e) {
    console.log('error', e)
    return false
  }
})

console.log('Copying plugins... ', copyPatterns)

module.exports = composePlugins(withNx(), withReact(), (config) => {
  // add fallback for node modules
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
    'assert/strict': require.resolve('assert/'), // Ensure 'assert/strict' is resolved
    assert: require.resolve('assert/'),
    os: false,
    timers: false,
    fs: false,
    module: false,
    tls: false,
    net: false,
    readline: false,
    child_process: false,
    tty: false,
    worker_threads: false // Explicitly ignore worker_threads
  };

  // add externals
  config.externals = {
    ...config.externals,
    solc: 'solc'
  };

  // add public path
  config.output.publicPath = process.env.NX_DESKTOP_FROM_DIST ? './' : '/';

  config.output.filename = `[name].${versionData.version}.${versionData.timestamp}.js`;
  config.output.chunkFilename = `[name].${versionData.version}.${versionData.timestamp}.js`;
  config.optimization.splitChunks = false;

  config.plugins.push(
    new CopyPlugin({
      patterns: [
        {
          from: '../../node_modules/monaco-editor/min/vs',
          to: 'assets/js/monaco-editor/min/vs'
        },
        ...copyPatterns
      ].filter(Boolean)
    }),
    new CopyFileAfterBuild(),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      url: ['url', 'URL'],
      process: 'process/browser'
    })
  );

  // source-map loader
  config.module.rules.push({
    test: /\.js$/,
    use: ['source-map-loader'],
    enforce: 'pre'
  });

  config.ignoreWarnings = [/Failed to parse source map/, /require function/];

  // set minimizer
  config.optimization.minimizer = [
    new TerserPlugin({
      parallel: true,
      terserOptions: {
        ecma: 2015,
        compress: false,
        mangle: false,
        format: { comments: false }
      },
      extractComments: false
    }),
    new CssMinimizerPlugin()
  ];

  if (process.env.NX_DESKTOP_FROM_DIST) {
    config.optimization.minimize = true;
  }

  config.watchOptions = {
    ignored: /node_modules/
  };

  console.log('config', process.env.NX_DESKTOP_FROM_DIST);
  return config;
});

class CopyFileAfterBuild {
  apply(compiler) {
    const onEnd = async () => {
      try {
        console.log('running CopyFileAfterBuild');
        const files = readdirSync('./dist/apps/etherscan');
        files.forEach((file) => {
          if (file.includes('plugin-etherscan')) {
            copyFileSync(`./dist/apps/etherscan/${file}`, `./dist/apps/remix-ide/${file}`);
          }
        });
      } catch (e) {
        console.error('running CopyFileAfterBuild failed with error: ' + e.message);
      }
    };
    compiler.hooks.afterEmit.tapPromise('FileManagerPlugin', onEnd);
  }
}
