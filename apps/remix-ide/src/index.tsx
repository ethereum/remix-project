// eslint-disable-next-line no-use-before-define
import React from 'react'
import './index.css'
import { ThemeModule } from './app/tabs/theme-module'
import { Preload } from './app/components/preload'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { GitHubPopupCallback } from './app/pages/GitHubPopupCallback'
import Config from './config'
import { Registry } from '@remix-project/remix-lib'
import { Storage } from '@remix-project/remix-lib'

import { createRoot } from 'react-dom/client'

; (async function () {
  try {
    const configStorage = new Storage('config-v0.8:')
    const config = new Config(configStorage)
    Registry.getInstance().put({ api: config, name: 'config' })
  } catch (e) { }
  const theme = new ThemeModule()
  theme.initTheme()

  const container = document.getElementById('root');
  const root = createRoot(container)
  if (container) {
    root.render(
      <BrowserRouter>
        <Routes>
          <Route path="/auth/github/callback" element={<GitHubPopupCallback />} />
          <Route path="*" element={<Preload root={root} />} />
        </Routes>
      </BrowserRouter>
    )
  }
})()
