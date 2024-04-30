import React, {useEffect, useRef, useContext} from 'react'
import {useIntl, FormattedMessage } from 'react-intl'
import {TEMPLATE_NAMES,TEMPLATE_METADATA} from '@remix-ui/workspace'
import {ThemeContext} from '../themeContext'
import Carousel from 'react-multi-carousel'
import WorkspaceTemplate from './workspaceTemplate'
import 'react-multi-carousel/lib/styles.css'
import CustomNavButtons from './customNavButtons'
import { appPlatformTypes, platformContext } from '@remix-ui/app'


export interface HomeTabGettingStartedProps {
  plugin: any
}

type WorkspaceTemplate = {
  gsID: string
  workspaceTitle: string
  description: string
  projectLogo: string
  callback: () => void
}

const workspaceTemplates: WorkspaceTemplate[] = [
  {
    gsID: 'sUTLogo',
    workspaceTitle: 'MultiSig',
    description: 'Create a new MultiSig wallet using this template.',
    projectLogo: 'assets/img/gnosissafeLogo.png',
    callback: () => createWorkspace('gnosisSafeMultisig')
  },
  {
    gsID: 'sUTLogo',
    workspaceTitle: 'ERC20',
    description: 'Create a new ERC20 token using this template.',
    projectLogo: 'assets/img/oxprojectLogo.png',
    callback: () => createWorkspace('zeroxErc20')
  },
  {
    gsID: 'sourcifyLogo',
    workspaceTitle: 'ERC20',
    description: 'Create a new ERC20 token using this template.',
    projectLogo: 'assets/img/openzeppelinLogo.png',
    callback: () => createWorkspace('ozerc20')
  },
  {
    gsID: 'sUTLogo',
    workspaceTitle: 'ERC721',
    description: 'Create a new ERC721 token using this template.',
    projectLogo: 'assets/img/openzeppelinLogo.png',
    callback: () => createWorkspace('ozerc721')
  },
  {
    gsID: 'sUTLogo',
    workspaceTitle: 'ERC1155',
    description: 'Create a new ERC1155 token using this template.',
    projectLogo: 'assets/img/openzeppelinLogo.png',
    callback: () => createWorkspace('ozerc1155')
  },
  {
    gsID: 'solhintLogo',
    workspaceTitle: 'Basic',
    description: 'Create a new project using this template.',
    projectLogo: 'assets/img/remixverticaltextLogo.png',
    callback: () => createWorkspace('remixDefault')
  }
]

export default function HomeTabGettingStarted() {

  const createWorkspace = async (templateName) => {

    if(platform === appPlatformTypes.desktop){
      await plugin.call('remix-templates', 'loadTemplateInNewWindow', templateName)
      return
    }

    let templateDisplayName = TEMPLATE_NAMES[templateName]
    const metadata = TEMPLATE_METADATA[templateName]
    if (metadata) {
      if (metadata.type === 'git') {
        await plugin.call('dGitProvider', 'clone', {url: metadata.url, branch: metadata.branch}, templateDisplayName)
      } else if (metadata && metadata.type === 'plugin') {
        await plugin.appManager.activatePlugin('filePanel')
        templateDisplayName = await plugin.call('filePanel', 'getAvailableWorkspaceName', templateDisplayName)
        await plugin.call('filePanel', 'createWorkspace', templateDisplayName, 'blank')
        await plugin.call('filePanel', 'setWorkspace', templateDisplayName)
        plugin.verticalIcons.select('filePanel')
        await plugin.call(metadata.name, metadata.endpoint, ...metadata.params)
      }
    } else {
      await plugin.appManager.activatePlugin('filePanel')
      templateDisplayName = await plugin.call('filePanel', 'getAvailableWorkspaceName', templateDisplayName)
      await plugin.call('filePanel', 'createWorkspace', templateDisplayName, templateName)
      await plugin.call('filePanel', 'setWorkspace', templateDisplayName)
      plugin.verticalIcons.select('filePanel')
    }
    _paq.push(['trackEvent', 'hometab', 'homeGetStarted', templateName])
  }

  return (
    <div>
      <span>Getting Started</span>
      <div className="w-100">
        <button className="btn btn-primary">Playground</button>
      </div>
    </div>
  )
}
