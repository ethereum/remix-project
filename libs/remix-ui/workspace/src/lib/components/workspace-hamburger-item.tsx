import React from 'react'
import { CustomTooltip, CustomMenu, CustomIconsToggle } from '@remix-ui/helper'
import { Dropdown, NavDropdown } from 'react-bootstrap'
import { FormattedMessage } from 'react-intl'

const _paq = (window._paq = window._paq || [])

export interface HamburgerMenuItemProps {
  hideOption: boolean
  kind: string
  actionOnClick: () => void
  fa: string
}

export function HamburgerMenuItem(props: HamburgerMenuItemProps) {
  const { hideOption } = props
  const uid = 'workspace' + props.kind
  return (
    <>
      <Dropdown.Item>
        <CustomTooltip placement="right" tooltipId={uid + 'Tooltip'} tooltipClasses="text-nowrap" tooltipText={<FormattedMessage id={'filePanel.workspace.' + props.kind} />}>
          <div
            data-id={uid}
            key={uid + '-fe-ws'}
            onClick={() => {
              props.actionOnClick()
              _paq.push(['trackEvent', 'fileExplorer', 'workspaceMenu', uid])
            }}
          >
            <span hidden={hideOption} id={uid} data-id={uid} className={props.fa + ' pl-2'} style={{ width: '1.4rem' }}></span>
            <span className="px-2">
              <FormattedMessage id={'filePanel.' + props.kind} />
            </span>
          </div>
        </CustomTooltip>
      </Dropdown.Item>
    </>
  )
}

// keeping the following for a later use:
export function NavHamburgerMenuItem(props: HamburgerMenuItemProps) {
  const { hideOption } = props
  const uid = 'workspace' + props.kind
  return (
    <>
      <NavDropdown.Item>
        <CustomTooltip placement="right" tooltipId={uid + 'Tooltip'} tooltipClasses="text-nowrap" tooltipText={<FormattedMessage id={'filePanel.workspace.' + props.kind} />}>
          <div
            data-id={uid}
            key={uid + '-fe-ws'}
            onClick={() => {
              props.actionOnClick()
              _paq.push(['trackEvent', 'fileExplorer', 'workspaceMenu', uid])
            }}
          >
            <span hidden={hideOption} id={uid} data-id={uid} className={props.fa + ' pl-2'} style={{ width: '1.4rem' }}></span>
            <span className="px-2">
              <FormattedMessage id={'filePanel.' + props.kind} />
            </span>
          </div>
        </CustomTooltip>
      </NavDropdown.Item>
    </>
  )
}

export interface HamburgerSubMenuItemProps {
  id: string
  title: string
  subMenus: Array<HamburgerMenuItemProps>
}

export function HamburgerSubMenuItem(props: HamburgerSubMenuItemProps) {
  return (
    <>
      <NavDropdown title={props.title} as={CustomMenu} key={props.id} id={props.id} drop="right">
        {props.subMenus.map((item) => (
          <NavHamburgerMenuItem kind={item.kind} fa={item.fa} hideOption={item.hideOption} actionOnClick={item.actionOnClick} />
        ))}
      </NavDropdown>
    </>
  )
}
