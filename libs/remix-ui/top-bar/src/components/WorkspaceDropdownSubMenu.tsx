import React from 'react'
import { Dropdown } from 'react-bootstrap'

export interface WorkspaceDropdownSubMenuProps {
  menuItems: { label: string, onClick: () => void, icon: string }[]
  style: React.CSSProperties
  ref: React.RefObject<HTMLElement>
}

export function WorkspaceDropdownSubMenu ({ menuItems, style, ref }: WorkspaceDropdownSubMenuProps) {
  return (
    <div
      className="border"
      style={style}
      ref={ref as React.RefObject<HTMLDivElement>}
    >
      <ul className="list-unstyled">
        {menuItems.map((item) => (
          <Dropdown.Item key={item.label} onClick={item.onClick}>
            <span className="pl-2">
              <i className={item.icon}></i>
              {item.label}
            </span>
          </Dropdown.Item>
        ))}
      </ul>
    </div>
  )
}
