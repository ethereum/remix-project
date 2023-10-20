import { CopyToClipboard } from '@remix-ui/clipboard'
import { TreeView, TreeViewItem } from '@remix-ui/tree-view'
import React from 'react'

export interface RemixUiCompileDetailsProps {
  plugin: any
  contractProperties: any
  intl: any
  selectedContract: string
  help: any
  insertValue: any
  saveAs: any
}

const _paq = (window._paq = window._paq || [])

export function RemixUiCompileDetails({ plugin, contractProperties, intl, selectedContract, saveAs, help, insertValue }: RemixUiCompileDetailsProps) {

  const downloadFn = () => {
    _paq.push(['trackEvent', 'compiler', 'compilerDetails', 'download'])
    saveAs(new Blob([JSON.stringify(contractProperties, null, '\t')]), `${selectedContract}_compData.json`)
  }
  return (
    <>
      <div>
        <span>{selectedContract}</span><span>Download Compile details</span>
      </div>
      <div className="remixui_detailsJSON">
        <TreeView>
          {Object.keys(contractProperties).map((propertyName, index) => {
            const copyDetails = (
              <span className="remixui_copyDetails">
                <CopyToClipboard tip={intl.formatMessage({id: 'solidity.copy'})} content={contractProperties[propertyName]} direction="top" />
              </span>
            )
            const questionMark = (
              <span className="remixui_questionMark">
                <i
                  title={intl.formatMessage({
                    id: `solidity.${propertyName}`,
                    defaultMessage: help[propertyName]
                  })}
                  className="fas fa-question-circle"
                  aria-hidden="true"
                ></i>
              </span>
            )

            return (
              <div className="remixui_log" key={index}>
                <TreeViewItem
                  label={
                    <div data-id={`remixui_treeviewitem_${propertyName}`} className="remixui_key">
                      {propertyName} {copyDetails} {questionMark}
                    </div>
                  }
                >
                  {insertValue(contractProperties, propertyName)}
                </TreeViewItem>
              </div>
            )
          })}
        </TreeView>
      </div>
    </>
  )
}
