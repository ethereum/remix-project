// eslint-disable-next-line no-use-before-define
import React from 'react'
import {render} from 'react-dom'
import './index.css'
import {ThemeModule} from './app/tabs/theme-module'
import {Preload} from './app/components/preload'
import Config from './config'
import {Registry} from '@remix-project/remix-lib'
import {Storage} from '@remix-project/remix-lib'

import * as esbuild from 'esbuild-wasm'




;(async function () {
  try {
    const configStorage = new Storage('config-v0.8:')
    const config = new Config(configStorage)
    Registry.getInstance().put({api: config, name: 'config'})
  } catch (e) {}
  const theme = new ThemeModule()
  theme.initTheme()

  await esbuild.initialize({
    wasmURL: './assets/esbuild.wasm',
  })

  const code = `import { ethers } from 'ethers'`

  const result = await esbuild.transform(code, {})
  await esbuild.build({
    
  })
  console.log(result)
  
  render(
    <React.StrictMode>
      <Preload></Preload>
    </React.StrictMode>,
    document.getElementById('root')
  )
  
})()
