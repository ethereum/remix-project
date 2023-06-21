import React from "react"

import { NavLink } from "react-router-dom"
import { CustomTooltip } from '@remix-ui/helper'
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
      to={{
        pathname: "/"
      }}
      className={({ isActive }) => isActive ? "btn p-0 m-0" : "btn text-dark p-0 m-0"}
      state={ from }
    >
      <CustomTooltip
        tooltipText='Home'
        tooltipId='etherscan-nav-home'
        placement='bottom'
      >
        <i className="fas fa-home"></i>
      </CustomTooltip>
    </NavLink>
  )
}

const ReceiptsIcon: React.FC<IconProps> = ({ from }: IconProps) => {
  return (
      <NavLink      
        data-id="receipts"
        to={{
          pathname: "/receipts"
        }}
        className={({ isActive }) => isActive ? "btn p-0 m-0 mx-2" : "btn text-dark p-0 m-0 mx-2"}
        state={ from }
      >
        <CustomTooltip
          tooltipText='Receipts'
          tooltipId='etherscan-nav-receipts'
          placement='bottom'
        >
          <i className="fas fa-receipt"></i>
        </CustomTooltip>
      </NavLink>
  )
}

const SettingsIcon: React.FC<IconProps> = ({ from }: IconProps) => {
  return (
    <NavLink
      data-id="settings"
      to={{
        pathname: "/settings"
      }}
      className={({ isActive }) => isActive ? "btn p-0 m-0" : "btn text-dark p-0 m-0"}
      state= {from}
    >
      <CustomTooltip
        tooltipText='Settings'
        tooltipId='etherscan-nav-settings'
        placement='bottom'
      >
        <i className="fas fa-cog"></i>
      </CustomTooltip>
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
        <div className="d-flex justify-content-between">
          <h6 className="d-inline">{title}</h6>
          <div>
            <HomeIcon from={from} />
            <ReceiptsIcon from={from} />
            <SettingsIcon from={from} />
          </div>
        </div>
      )}
    </AppContext.Consumer>
  )
}
