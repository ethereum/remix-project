import React from 'react'
import { NavLink } from 'react-router-dom'

interface NavItemProps {
  to: string
  icon: JSX.Element
  title: string
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, title }) => {
  return (
    <NavLink
      // data-id="home"
      to={to}
      className={({ isActive }) => 'p-2 text-decoration-none ' + (isActive ? 'bg-primary text-white' : 'bg-secondary')}
      // state={from}
    >
      <span className="d-flex flex-column align-items-center justify-content-center" style={{ width: '60px' }}>
        <span>{icon}</span>
        <span>{title}</span>
      </span>
    </NavLink>
  )
}

export const NavMenu = () => {
  return (
    <nav className="d-flex flex-row justify-content-around bg-secondary fixed-top">
      <NavItem to="/" icon={<i className="fas fa-home"></i>} title="Verify" />
      <NavItem to="/receipts" icon={<i className="fas fa-receipt"></i>} title="Receipts" />
      <NavItem to="/lookup" icon={<i className="fas fa-search"></i>} title="Lookup" />
      <NavItem to="/settings" icon={<i className="fas fa-cog"></i>} title="Settings" />
    </nav>
  )
}
