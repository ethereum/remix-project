import { CopyToClipboard } from '@remix-ui/clipboard'
import { CustomTooltip } from '@remix-ui/helper'
import { TreeView, TreeViewItem } from '@remix-ui/tree-view'
import { ContractPropertyName } from '@remix-ui/solidity-compiler'

import React from 'react'
import SolidityCompile from './components/solidityCompile'
import VyperCompile from './components/vyperCompile'

export interface RemixUiCompileDetailsProps {
  plugin?: any
  contractProperties: any
  selectedContract: string
  help?: any
  insertValue?: any
  saveAs: any
}

const _paq = (window._paq = window._paq || [])

export function RemixUiCompileDetails({ plugin, contractProperties, selectedContract, saveAs, help, insertValue }: RemixUiCompileDetailsProps) {
  console.log(contractProperties)

  return (
    <>
      {
        contractProperties.abi && contractProperties.gasEstimates.Creation && contractProperties.web3Deploy ? (
          <SolidityCompile
            contractProperties={contractProperties}
            plugin={plugin}
            selectedContract={selectedContract}
            help={help}
            insertValue={insertValue}
            saveAs={saveAs}
          /> ) :
          <VyperCompile
            saveAs={saveAs}
            contractProperties={contractProperties}
            selectedContract={selectedContract}
          />
      }
    </>
  )
}
