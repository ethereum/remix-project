import React from 'react'

import {NavLink} from 'react-router-dom'

interface NavItemProps {
  to: string
  icon: JSX.Element
  title: string
}

const NavItem = ({to, icon, title}: NavItemProps) => {
  return (
    <NavLink
      // data-id="home"
      to={to}
      className={({isActive}) => (isActive ? 'border border-secondary shadow-none btn p-1 m-0' : 'border-0 shadow-none btn p-1 m-0')}
      style={({isActive}) => (!isActive ? {width: '1.8rem', filter: 'contrast(0.5)'} : {width: '1.8rem'})}
      // state={from}
    >
      <div>
        <div>{icon}</div>
        <div>{title}</div>
      </div>
    </NavLink>
  )
}

export const NavMenu = () => {
  return (
    <nav className="d-flex flex-row justify-content-between">
      <NavItem to="/" icon={<i className="fas fa-home"></i>} title="Verify" />
      <NavItem to="/receipts" icon={<i className="fas fa-receipt"></i>} title="Receipts" />
      <NavItem to="/lookup" icon={<i className="fas fa-search"></i>} title="Lookup" />
      <NavItem to="/settings" icon={<i className="fas fa-cog"></i>} title="Settings" />
    </nav>
  )
}
