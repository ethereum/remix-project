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
      to={to}
      className={({ isActive }) => 'text-decoration-none d-flex px-1 py-1 flex-column justify-content-center small ' + (isActive ? "bg-light border-top border-left border-right" : "border-0 bg-transparent")}
    >
      <span className=''>
        <span>{icon}</span>
        <span className="ml-2">{title}</span>
      </span>
    </NavLink>
  )
}

export const NavMenu = () => {
  return (
    <nav className="d-flex medium flex-row w-100" style={{backgroundColor: 'var(--body-bg)!important'}}>
      <NavItem to="/" icon={<i className="fas fa-home"></i>} title="Verify" />
      <NavItem to="/receipts" icon={<i className="fas fa-receipt"></i>} title="Receipts" />
      <NavItem to="/lookup" icon={<i className="fas fa-search"></i>} title="Lookup" />
      <NavItem to="/settings" icon={<i className="fas fa-cog"></i>} title="Settings" />
    </nav>
  )
}
