import React from 'react'

import { NavLink } from 'react-router-dom'

interface NavItemProps {
  to: string
  icon: JSX.Element
  title: string
}

const NavItem = ({ to, icon, title }: NavItemProps) => {
  return (
    <NavLink
      // data-id="home"
      to={to}
      className={({ isActive }) => 'p-2 ' + (isActive ? 'bg-primary text-white' : 'bg-secondary')}
      // state={from}
    >
      <div className="d-flex flex-column align-items-center justify-content-center">
        <div>{icon}</div>
        <div>{title}</div>
      </div>
    </NavLink>
  )
}

export const NavMenu = () => {
  return (
    <nav className="d-flex flex-row justify-content-around">
      <NavItem to="/" icon={<i className="fas fa-home"></i>} title="Verify" />
      <NavItem to="/receipts" icon={<i className="fas fa-receipt"></i>} title="Receipts" />
      <NavItem to="/lookup" icon={<i className="fas fa-search"></i>} title="Lookup" />
      <NavItem to="/settings" icon={<i className="fas fa-cog"></i>} title="Settings" />
    </nav>
  )
}
