import { createWorkspace } from 'libs/remix-ui/workspace/src/lib/actions'
import React from 'react'
import { Button } from 'react-bootstrap'

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

export default function GettingStarted() {
  return (
    <div>
      <span>Getting Started</span>
      <div className="w-100">
        <Button></Button>
      </div>
    </div>
  )
}
