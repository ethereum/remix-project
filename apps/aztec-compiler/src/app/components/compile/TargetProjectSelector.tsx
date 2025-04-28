import React from 'react'
import { CustomTooltip } from '@remix-ui/helper'

export const TargetProjectSelector = ({ projectList, targetProject, setTarget, onReload }) => (
  <div className="mb-3">
    <div className="d-flex align-items-center text-muted text-white">
      <small className="text-white">TARGET PROJECT</small>
      <i
        className="fas fa-sync ml-2"
        title="Reload"
        style={{ cursor: 'pointer' }}
        onClick={onReload}
      />
    </div>
    <CustomTooltip tooltipText="Target project must be under root/aztec directory/">
      <select
        className="custom-select mt-2"
        value={targetProject}
        onChange={setTarget}
      >
        <option value="">-- Select Project --</option>
        {projectList.map((proj, idx) => <option key={idx} value={proj}>{proj}</option>)}
      </select>
    </CustomTooltip>
  </div>
)