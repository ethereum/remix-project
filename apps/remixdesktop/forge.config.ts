import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { WebpackPlugin } from '@electron-forge/plugin-webpack';

import { mainConfig } from './webpack.main.config';
import { rendererConfig } from './webpack.renderer.config';
import copy from 'recursive-copy';
import fs from 'fs';

const config: ForgeConfig = {
  packagerConfig: {},
  rebuildConfig: {},
  makers: [new MakerSquirrel({}), new MakerZIP({}, ['darwin']), new MakerRpm({}), new MakerDeb({})],
  hooks:
  {
    generateAssets: async (forgeConfig, platform, arch) => {
      console.log('We should generate some assets here');
      // read the currrent directory
      fs.writeFileSync('./src/assets.txt', 'Hello World')
    },
    postStart: async (appProcess: any) => {
      console.log('We should start the app here');
      // list files in .webpack/renderer
      //const files = fs.readdirSync('./.webpack/renderer/main_window');
      //console.log(files);
    },
    prePackage: async (forgeConfig, options) => {
      console.log('We should package the app here', options, forgeConfig);
      // remove all files in .webpack/renderer
      fs.rmdirSync('./.webpack/renderer/main_window', { recursive: true });

      await copy('/Volumes/bunsen/code/rmproject2/remix-project/dist/apps/remix-ide', './.webpack/renderer/main_window');
    },
    postPackage: async (forgeConfig, options) => {
      console.info('Packages built at:', options.outputPaths);
    }
  },
  plugins: [
    new WebpackPlugin({
      mainConfig,
      devServer: {
        setupMiddlewares: (middlewares: any[], devServer: any) => {
          console.log('We should start the dev server here');
          return middlewares;
        }
      },
      devContentSecurityPolicy: // allow all content for now
      "default-src *  data: blob: filesystem: about: ws: wss: 'unsafe-inline' 'unsafe-eval'; script-src * data: blob: 'unsafe-inline' 'unsafe-eval'; connect-src * data: blob: 'unsafe-inline'; img-src * data: blob: 'unsafe-inline'; frame-src * data: blob: ; style-src * data: blob: 'unsafe-inline'; font-src * data: blob: 'unsafe-inline';"
      ,renderer: {
        config: rendererConfig,
        entryPoints: [
          {
            html: '../../dist/apps/remix-ide/index.html',
            js: './src/renderer.ts',
            name: 'main_window',
            preload: {
              js: './src/preload.ts',
            },
          },
        ],
      },
    }),
  ],
};

export default config;
