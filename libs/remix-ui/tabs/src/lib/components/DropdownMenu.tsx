import React, { useState, useRef, useEffect } from 'react'
import './DropdownMenu.css'
import ArrowRightSm from '../../assets/icons/ArrowRightSm'

export interface MenuItem {
  label: string
  submenu?: MenuItem[]
  onClick?: () => void
  icon?: React.ReactNode
  borderTop?: boolean
  borderBottom?: boolean
}

interface DropdownMenuProps {
  items: MenuItem[]
  disabled?: boolean
  onOpen?: () => void
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ items, disabled, onOpen }) => {
  const [open, setOpen] = useState(false)
  const [activeSubmenu, setActiveSubmenu] = useState<number | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
        setActiveSubmenu(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="custom-dropdown-wrapper" ref={ref}>
      <button 
        className="custom-dropdown-trigger btn btn-primary"
        onClick={() => {
          if (!disabled) {
            setOpen(!open)
            if (!open && onOpen) onOpen()
          }
        }}
        disabled={disabled}
      >
        <i className="fas fa-angle-down" style={{color: 'white'}}></i>
      </button>

      {open && (
        <div className="custom-dropdown-panel">
          {items.map((item, idx) => (
            <div
              key={idx}
              className={`custom-dropdown-item ${disabled ? 'disabled' : ''} ${item.borderTop ? 'border-top' : ''} ${item.borderBottom ? 'border-bottom' : ''}`}
              onMouseEnter={() => !disabled && item.submenu && setActiveSubmenu(idx)}
              onMouseLeave={() => !disabled && setActiveSubmenu(null)}
              onClick={() => {
                if (!disabled && item.onClick) {
                  item.onClick()
                  setOpen(false)
                }
              }}
            >
              {item.icon && <span className="custom-dropdown-item-icon">{item.icon}</span>}
              <span>{item.label}</span>
              {item.submenu &&  <span className="custom-dropdown-item-icon"><ArrowRightSm /> </span>}

              {activeSubmenu === idx && item.submenu && (
                <div className="custom-dropdown-submenu">
                  {item.submenu.map((sub, subIdx) => (
                    <div 
                      key={subIdx} 
                      className={`custom-dropdown-item ${sub.borderTop ? 'border-top' : ''} ${sub.borderBottom ? 'border-bottom' : ''}`}
                      onClick={() => {
                          if(!disabled && sub.onClick){
                            sub.onClick()
                            setOpen(false)
                          }
                        }
                      }
                    >
                      {sub.icon && <span className="custom-dropdown-item-icon">{sub.icon}</span>}
                      <span>{sub.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default DropdownMenu