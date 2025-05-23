import React from 'react'
import { CustomTooltip } from '@remix-ui/helper'

export const ImportExampleSelector = ({ examples, exampleToImport, setExampleToImport, importExample }) => (
  <div className="mb-3">
    <div className="text-muted"><small className="text-white">IMPORT EXAMPLE PROJECT</small></div>
    <CustomTooltip tooltipText="Download template code">
      <select
        className="custom-select mt-2"
        value={exampleToImport}
        onChange={(e) => setExampleToImport(e.target.value)}
      >
        <option value="">-- Select Example --</option>
        {examples.map((ex) => <option key={ex} value={ex}>{ex}</option>)}
      </select>
    </CustomTooltip>
    <button
      className="btn btn-secondary btn-block mt-2"
      disabled={!exampleToImport}
      onClick={() => importExample(exampleToImport)}
    >
      Import Selected Example
    </button>
  </div>
)