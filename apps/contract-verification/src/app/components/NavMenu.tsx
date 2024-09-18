import React from 'react'
import { NavLink } from 'react-router-dom'

interface NavItemProps {
  to: string
  icon: JSX.Element
  title: string
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, title }) => {
  return (
    <NavLink to={to} className={({ isActive }) => 'text-decoration-none d-flex flex-column justify-content-center px-2 ' + (isActive ? 'bg-transparent' : 'bg-dark')}>
      <span>
        <span>{icon}</span>
        <span className="ml-2">{title}</span>
      </span>
    </NavLink>
  )
}

export const NavMenu = () => {
  return (
    <nav className="d-flex flex-row justify-start fixed-top w-100" style={{ height: '40px' }}>
      <NavItem to="/" icon={<i className="fas fa-home"></i>} title="Verify" />
      <NavItem to="/receipts" icon={<i className="fas fa-receipt"></i>} title="Receipts" />
      <NavItem to="/lookup" icon={<i className="fas fa-search"></i>} title="Lookup" />
      <NavItem to="/settings" icon={<i className="fas fa-cog"></i>} title="Settings" />
      <div className="flex-grow-1 bg-dark"></div>
    </nav>
  )
}
