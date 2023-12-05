import React from 'react'

import {NavLink} from 'react-router-dom'
import {CustomTooltip} from '@remix-ui/helper'
import {AppContext} from '../AppContext'

interface Props {
  title?: string
  from: string
}

interface IconProps {
  from: string
}

const HomeIcon: React.FC<IconProps> = ({from}: IconProps) => {
  return (
    <NavLink
      data-id="home"
      to={{
        pathname: '/'
      }}
      className={({isActive}) => (isActive ? 'border border-secondary shadow-none btn p-1 m-0' : 'border-0 shadow-none btn p-1 m-0')}
      style={({isActive}) => (!isActive ? {width: '1.8rem', filter: 'contrast(0.5)'} : {width: '1.8rem'})}
      state={from}
    >
      <CustomTooltip tooltipText="Home" tooltipId="etherscan-nav-home" placement="bottom">
        <i className="fas fa-home"></i>
      </CustomTooltip>
    </NavLink>
  )
}

const ReceiptsIcon: React.FC<IconProps> = ({from}: IconProps) => {
  return (
    <NavLink
      data-id="receipts"
      to={{
        pathname: '/receipts'
      }}
      className={({isActive}) => (isActive ? 'border border-secondary shadow-none btn p-1 m-0' : 'border-0 shadow-none btn p-1 m-0')}
      style={({isActive}) => (!isActive ? {width: '1.8rem', filter: 'contrast(0.5)'} : {width: '1.8rem'})}
      state={from}
    >
      <CustomTooltip tooltipText="Receipts" tooltipId="etherscan-nav-receipts" placement="bottom">
        <i className="fas fa-receipt"></i>
      </CustomTooltip>
    </NavLink>
  )
}

const SettingsIcon: React.FC<IconProps> = ({from}: IconProps) => {
  return (
    <NavLink
      data-id="settings"
      to={{
        pathname: '/settings'
      }}
      className={({isActive}) => (isActive ? 'border border-secondary shadow-none btn p-1 m-0' : 'border-0 shadow-none btn p-1 m-0')}
      style={({isActive}) => (!isActive ? {width: '1.8rem', filter: 'contrast(0.5)'} : {width: '1.8rem'})}
      state={from}
    >
      <CustomTooltip tooltipText="Settings" tooltipId="etherscan-nav-settings" placement="bottom">
        <i className="fas fa-cog"></i>
      </CustomTooltip>
    </NavLink>
  )
}

export const HeaderWithSettings: React.FC<Props> = ({title = '', from}) => {
  return (
    <AppContext.Consumer>
      {() => (
        <div className="d-flex justify-content-between">
          <h6 className="d-inline">{title}</h6>
          <div className="nav">
            <HomeIcon from={from} />
            <ReceiptsIcon from={from} />
            <SettingsIcon from={from} />
          </div>
        </div>
      )}
    </AppContext.Consumer>
  )
}
