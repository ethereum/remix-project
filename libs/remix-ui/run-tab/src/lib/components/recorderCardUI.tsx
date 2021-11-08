// eslint-disable-next-line no-use-before-define
import React from 'react'
import { TreeView, TreeViewItem } from '@remix-ui/tree-view'
import { RecorderProps } from '../types'

export function RecorderUI (props: RecorderProps) {
  const card = (title: string, recorderCount: number) => {
    return (
      <div className="d-flex justify-content-between align-items-center" onClick={() => {}}>
        <div className="pr-1 d-flex flex-row">
          <div>{title}</div>
          <div>
            <div className="d-flex flex-column">
              <div className="ml-2 badge badge-pill badge-primary" title="The number of recorded transactions">{recorderCount}</div>
            </div>
          </div>
        </div>
        <div>
          <div><i className="udapp_arrow fas fa-angle-down"></i></div>
        </div>
      </div>
    )
  }

  const triggerRecordButton = () => {
    // dispatch saveScenario()
    // this.saveScenario(
    //   (path, cb) => {
    //     modalDialogCustom.prompt('Save transactions as scenario', 'Transactions will be saved in a file under ' + path, 'scenario.json', cb)
    //   },
    //   (error) => {
    //     if (error) return modalDialogCustom.alert(error)
    //   }
    // )
  }

  const handleClickRunButton = () => {
    // dispatchRunButtonClickHandler
    // const file = this.config.get('currentFile')
    // if (!file) return modalDialogCustom.alert('A scenario file has to be selected')
    // this.runScenario(file)
  }

  return (
    <div className="udapp_cardContainer list-group-item border-0">
      <TreeView>
        <TreeViewItem label={card('Transactions recorded', 0)} showIcon={false} labelClass="ml-n1">
          <div className="d-flex flex-column">
            <div className="udapp_recorderDescription mt-2">
              All transactions (deployed contracts and function executions) in this environment can be saved and replayed in
              another environment. e.g Transactions created in Javascript VM can be replayed in the Injected Web3.
            </div>
            <div className="udapp_transactionActions">
              <i className="fas fa-save savetransaction udapp_recorder udapp_icon"
                onClick={triggerRecordButton} title="Save Transactions" aria-hidden="true">
              </i>
              <i className="fas fa-play runtransaction udapp_runTxs udapp_icon" title="Run Transactions" aria-hidden="true" onClick={handleClickRunButton}></i>
            </div>
          </div>
        </TreeViewItem>
      </TreeView>
    </div>
  )
}
