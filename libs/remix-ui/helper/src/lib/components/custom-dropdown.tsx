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

export const CustomIconsToggle = React.forwardRef(({ children, mouseOverAction, icon, className = '' }: { children: React.ReactNode, mouseOverAction: () => void, icon: string, className: string }, ref: Ref<HTMLSpanElement>) => (
  <span
    ref={ref}
    onClick={(e) => {
      e.preventDefault()
    }}
    onMouseOver={mouseOverAction}
    className={`${className.replace('dropdown-toggle', '')} mb-0 pb-0 d-flex justify-content-end align-items-end remixuimenuicon_shadow`}
  >
    { icon && <i className={`${icon}`}></i> }
  </span>
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
