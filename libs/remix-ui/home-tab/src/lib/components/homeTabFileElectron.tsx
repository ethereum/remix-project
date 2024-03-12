/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useRef, useReducer } from 'react'
import { FormattedMessage } from 'react-intl'
import { ModalDialog } from '@remix-ui/modal-dialog' // eslint-disable-line
import { Toaster } from '@remix-ui/toaster' // eslint-disable-line
const _paq = window._paq = window._paq || [] // eslint-disable-line
import { CustomTooltip } from '@remix-ui/helper';

interface HomeTabFileProps {
  plugin: any
}

export const HomeTabFileElectron = ({ plugin }: HomeTabFileProps) => {

  const loadTemplate = async () => {
    plugin.call('filePanel', 'loadTemplate')
  }

  const clone = async () => {
    plugin.call('filePanel', 'clone')
  }

  const importFromGist = () => {
    _paq.push(['trackEvent', 'hometab', 'filesSection', 'importFromGist'])
    plugin.call('gistHandler', 'load', '')
    plugin.verticalIcons.select('filePanel')
  }

  return (
    <div className="justify-content-start mt-1 p-2 d-flex flex-column" id="hTFileSection">
      <label style={{ fontSize: "1.2rem" }}><FormattedMessage id='home.files' /></label>
      <label style={{ fontSize: "0.8rem" }} className="pt-2"><FormattedMessage id='home.loadFrom' /></label>
      <div className="d-flex">

        <button className="btn p-2 border mr-2" data-id="landingPageImportFromTemplate" onClick={async () => await loadTemplate()}>Project Template</button>
        <button className="btn p-2 border mr-2" data-id="landingPageImportFromGit" onClick={async () => await clone()}>Clone a Git Repository</button>
        <button className="btn p-2 border mr-2" data-id="landingPageImportFromGist" onClick={() => importFromGist()}>Gist</button>
      </div>
    </div>
  )
}