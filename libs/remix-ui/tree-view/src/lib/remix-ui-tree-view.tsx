import React, { useState } from 'react'

import './remix-ui-tree-view.css'

export interface RemixUiTreeViewProps {
  data: []
}

export const RemixUiTreeView = (props: RemixUiTreeViewProps) => {
  return (
    <ul key="" data-id="treeViewUl" className="ul_tv ml-0 px-2">
      <li key="vm trace step" data-id="treeViewLivm trace step" className="li_tv">
        <div key="vm trace step" data-id="treeViewDivvm trace step" className="d-flex flex-row align-items-center">
          <div className="px-1 fas fa-caret-right caret caret_tv_2nzIvs" style={{ visibility: "hidden" }}>
          </div>
            <span className="w-100">
              <div className="d-flex mb-1 flex-row label_item">
                <label className="small font-weight-bold pr-1 label_key">
                  vm trace step:
                </label>
                <label className="m-0 label_value">-</label>
              </div>
            </span>
          </div>
        </li>
        <li key="execution step" data-id="treeViewLiexecution step" className="li_tv">
          <div key="execution step" data-id="treeViewDivexecution step" className="d-flex flex-row align-items-center">
            <div className="px-1 fas fa-caret-right caret caret_tv" style={{ visibility: "hidden" }}>
            </div>
            <span className="w-100">
              <div className="d-flex mb-1 flex-row label_item">
                <label className="small font-weight-bold pr-1 label_key">
                  execution step:
                </label>
                <label className="m-0 label_value">-</label>
              </div>
            </span>
          </div>
        </li>
      </ul>)
}

export default RemixUiTreeView
