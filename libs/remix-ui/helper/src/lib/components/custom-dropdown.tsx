// The forwardRef is important!!

import React, { Ref } from "react"

// Dropdown needs access to the DOM node in order to position the Menu
export const CustomToggle = React.forwardRef(({ children, onClick, icon, className = '' }: { children: React.ReactNode, onClick: (e) => void, icon: string, className: string }, ref: Ref<HTMLButtonElement>) => (
  <button
    ref={ref}
    onClick={(e) => {
      e.preventDefault()
      onClick(e)
    }}
    className={className.replace('dropdown-toggle', '')}
  >
    <div className="d-flex">
      <div className="mr-auto">{ children }</div>
      { icon && <div className="pr-1"><i className={`${icon} pr-1`}></i></div> }
      <div><i className="fad fa-sort-circle"></i></div>
    </div>
  </button>
))

// forwardRef again here!
// Dropdown needs access to the DOM of the Menu to measure it
export const CustomMenu = React.forwardRef(
  ({ children, style, className, 'aria-labelledby': labeledBy }: { children: React.ReactNode, style?: React.CSSProperties, className: string, 'aria-labelledby'?: string }, ref: Ref<HTMLDivElement>) => {
    return (
      <div
        ref={ref}
        style={style}
        className={className}
        aria-labelledby={labeledBy}
      >
        <ul className="list-unstyled mb-0">
          {
           children
          }
        </ul>
      </div>
    )
  },
)
