import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { WebpackPlugin } from '@electron-forge/plugin-webpack';

import { mainConfig } from './webpack.main.config';

import copy from 'recursive-copy';
import fs from 'fs';

const ideconfig = require('../remix-ide/webpack.config.js');

console.log(ideconfig);

const config: ForgeConfig = {
  packagerConfig: {
    ignore: 
  },
  rebuildConfig: {},
  makers: [new MakerSquirrel({}), new MakerZIP({}, ['darwin']), new MakerRpm({}), new MakerDeb({})],
  hooks:
  {
    
  },
  plugins: [
    /*
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
        config: ideconfig,
        entryPoints: [
        ]
      },
    }),
    */
  ],
};

export default config;
