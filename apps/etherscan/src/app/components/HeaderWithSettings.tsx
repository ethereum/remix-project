import React from "react"

import { NavLink } from "react-router-dom"
import { CustomTooltip } from '@remix-ui/helper';
import { AppContext } from "../AppContext"

interface Props {
  title?: string
  showBackButton?: boolean
  from: string
}

interface IconProps {
  from: string
}

const HomeIcon: React.FC<IconProps> = ({ from }: IconProps) => {
  return (
      <NavLink
        data-id="home"
        to="/"
        state={ from }
        style={{ marginRight: "0.4em" }}
      >
        <i className="fas fa-home"></i>
      </NavLink>
  )
}

const ReceiptsIcon: React.FC<IconProps> = ({ from }: IconProps) => {
  return (
      <NavLink      
        data-id="receipts"
        to="/receipts"
        state={ from }
        style={{ marginRight: "0.4em" }}
      >
        <i className="fas fa-receipt"></i>
      </NavLink>
  )
}

const SettingsIcon: React.FC<IconProps> = ({ from }: IconProps) => {
  return (
    <NavLink
      data-id="settings"
      to="/settings"
      state= {from}
      style={{ marginRight: "0.4em" }}
    >
      <i className="fas fa-cog"></i>
    </NavLink>
  )
}

export const HeaderWithSettings: React.FC<Props> = ({
  title = "",
  showBackButton = false,
  from,
}) => {
  return (
    <AppContext.Consumer>
      {() => (
        <div>
          <h6 className="d-inline">{title}</h6>
          <div style={{ float: "right" }}>
            <HomeIcon from={from} />
            <ReceiptsIcon from={from} />
            <SettingsIcon from={from} />
          </div>
        </div>
      )}
    </AppContext.Consumer>
  )
}
