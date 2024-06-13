import React from 'react'

interface DropdownItem {
  value: string
  name: string
}

interface DropdownProps {
  label: string
  items: DropdownItem[]
  id: string
}

export const Dropdown: React.FC<DropdownProps> = ({label, items, id}) => {
  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      <select className="form-control custom-select pr-4" id={id}>
        {items.map((item, index) => (
          <option value={item.value} key={index}>
            {item.name}
          </option>
        ))}
      </select>
    </div>
  )
}
