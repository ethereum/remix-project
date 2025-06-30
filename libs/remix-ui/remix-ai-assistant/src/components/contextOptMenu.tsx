import React, { Dispatch } from 'react'
import { AiAssistantType, AiContextType, groupListType } from '../types/componentTypes'

export interface GroupListMenuProps {
  setChoice: Dispatch<React.SetStateAction<AiContextType | AiAssistantType | any>>
  choice: AiContextType | AiAssistantType | any
  setShowOptions: Dispatch<React.SetStateAction<boolean>>
  groupList: groupListType[]
}

export default function GroupListMenu(props: GroupListMenuProps) {

  return (
    <div className="btn-group-vertical">
      {props.groupList.map((item, index) => (
        <button
          className="btn btn-light"
          onClick={() => {
            props.setChoice(item.stateValue)
            props.setShowOptions(false)
          }}
        >
          <div className="d-flex flex-column small text-left">
            <span className="font-semibold text-white mb-1">{item.label}</span>
            <div className="d-flex justify-content-between">
              <span className="text-light mr-2 text-wrap">{item.bodyText}</span>{ props.choice === item.stateValue && <span className={item.icon}></span> }
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}