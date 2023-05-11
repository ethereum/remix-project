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
        state={ from }
        className="mx-2"
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
