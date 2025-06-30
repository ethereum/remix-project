import React, { Dispatch } from 'react'
import { AiContextType, groupListType } from '../types/componentTypes'

export interface ContextOptMenuProps {
  setContextChoice: Dispatch<React.SetStateAction<AiContextType>>
  contextChoice: AiContextType
  setShowContextOptions: Dispatch<React.SetStateAction<boolean>>
}

export default function ContextOptMenu(props: ContextOptMenuProps) {
  const groupList: groupListType[] = [
    {
      label: 'None',
      bodyText: 'Assistant will automatically decide the context',
      icon: 'fa-solid fa-check',
      stateValue: 'none'
    },
    {
      label: 'Current file',
      bodyText: 'Add the current file in the editor as context',
      icon: 'fa-solid fa-check',
      stateValue: 'current'
    },
    {
      label: 'All opened files',
      bodyText: 'Adds all files opened in the editor as context',
      icon: 'fa-solid fa-check',
      stateValue: 'opened'
    },
    {
      label: 'Workspace',
      bodyText: 'Uses the current workspace as context',
      icon: 'fa-solid fa-check',
      stateValue: 'workspace'
    }
  ]

  return (
    <div className="btn-group-vertical">
      {groupList.map((item, index) => (
        <button
          className="btn btn-light"
          onClick={() => {
            props.setContextChoice(item.stateValue)
            props.setShowContextOptions(false)
          }}
        >
          <div className="d-flex flex-column small text-left">
            <span className="font-semibold text-white mb-1">{item.label}</span>
            <div className="d-flex justify-content-between">
              <span className="text-light mr-2 text-wrap">{item.bodyText}</span>{ props.contextChoice === item.stateValue && <span className={item.icon}></span> }
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}