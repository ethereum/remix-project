import React, { ReactNode, Ref } from 'react'
import { Dropdown, FormControl } from 'react-bootstrap'

// The forwardRef is important!!
// Dropdown needs access to the DOM node in order to position the Menu
const CustomToggle = React.forwardRef(({ children, onClick }: { children?: ReactNode, onClick: (e) => void }, ref: Ref<HTMLAnchorElement>) => (
  <a
    href=""
    ref={ref}
    onClick={(e) => {
      e.preventDefault()
      onClick(e)
    }}
  >
    { children }
  </a>
))

export const CloneWorkspace = () => {

  return (
    <Dropdown className="inline">
      <Dropdown.Toggle as={CustomToggle} id="dropdown-custom-components">
        <i className="fas fa-cloud-download remixui_menuicon"></i>
      </Dropdown.Toggle>

      <Dropdown.Menu>
        {/* <Dropdown.Item eventKey="1">
          <FormControl
              autoFocus
              className="mx-3 my-2 w-auto"
              placeholder="Type to filter..."
              onChange={(e) => setValue(e.target.value)}
              value={value}
            />
        </Dropdown.Item> */}
          <FormControl
            autoFocus
            className="mx-3 my-2 w-auto"
            placeholder="Type to filter..."
            onChange={() => {}}
            value=''
          />
      </Dropdown.Menu>
    </Dropdown>
  )
}