import { CopyToClipboard } from '@remix-ui/clipboard'
import { CustomTooltip } from '@remix-ui/helper'
import { ContractPropertyName } from '@remix-ui/solidity-compiler'
import React from 'react'
import { TreeView, TreeViewItem } from '@remix-ui/tree-view'
import { useIntl } from 'react-intl'
const _paq = (window._paq = window._paq || [])

export default function SolidityCompile({ contractProperties, selectedContract, help, insertValue, saveAs, plugin }: any) {
  const intl = useIntl()
  const downloadFn = () => {
    _paq.push(['trackEvent', 'compiler', 'compilerDetails', 'download'])
    saveAs(new Blob([JSON.stringify(contractProperties, null, '\t')]), `${selectedContract}_compData.json`)
  }
  return (
    <>
      <div className="d-flex justify-content-between align-items-center mr-1">
        <span className="lead">{selectedContract}</span>
        <CustomTooltip tooltipText={intl.formatMessage({ id: 'solidity.compileDetails' })}>
          <span className="btn btn-outline-success border-success mr-1" onClick={downloadFn}>Download</span>
        </CustomTooltip>
      </div>
      <div className="remixui_detailsJSON">
        {<TreeView>
          {Object.keys(contractProperties).map((propertyName: ContractPropertyName, index) => {
            const copyDetails = (
              <span className="remixui_copyDetails">
                <CopyToClipboard tip={intl.formatMessage({ id: 'solidity.copy' })} content={contractProperties[propertyName]} direction="top" />
              </span>
            )
            const questionMark = (
              <CustomTooltip
                tooltipText={intl.formatMessage({
                  id: `solidity.${propertyName}`,
                  defaultMessage: help[propertyName]
                })}
              >
                <span className="remixui_questionMark">
                  <i
                    className="fas fa-info"
                    aria-hidden="true"
                  ></i>
                </span>
              </CustomTooltip>
            )

            return (
              <div className="remixui_log" key={index}>
                <TreeViewItem
                  label={
                    <div data-id={`remixui_treeviewitem_${propertyName}`} className="remixui_key">
                      {propertyName} {copyDetails} {questionMark}
                    </div>
                  }
                  expand={propertyName === 'metadata' || propertyName === 'bytecode' ? true : false}
                  iconY='fas fa-caret-down'
                >
                  {insertValue(contractProperties, propertyName)}
                </TreeViewItem>
              </div>
            )
          })}
        </TreeView>}
      </div>
    </>
  )
}
