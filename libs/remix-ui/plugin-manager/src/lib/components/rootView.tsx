/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { Fragment, ReactNode, useEffect, useState } from 'react' // eslint-disable-line no-use-before-define
import { FormattedMessage, useIntl } from 'react-intl'
import { PluginManagerComponent, PluginManagerSettings } from '../../types'
import PermisssionsSettings from './permissionsSettings'
import { Profile } from '@remixproject/plugin-utils'
import LocalPluginForm from './LocalPluginForm'
import { Form } from 'react-bootstrap'

interface RootViewProps {
  pluginComponent: PluginManagerComponent
  children: ReactNode
  filterByRemix: boolean
  setFilterByRemix: (value: boolean) => void
}

export interface pluginDeactivated {
  flag: boolean
  profile: Profile
}

export interface pluginActivated {
  flag: boolean
  profile: Profile
}

function RootView({ pluginComponent, children, filterByRemix, setFilterByRemix }: RootViewProps) {
  const intl = useIntl()
  const [visible, setVisible] = useState<boolean>(true)
  const [filterPlugins, setFilterPlugin] = useState<string>('')
  const [showFilters, setShowFilters] = useState<boolean>(false)

  const openModal = () => setVisible(false)
  const closeModal = () => setVisible(true)

  useEffect(() => {
    pluginComponent.getAndFilterPlugins(filterPlugins)
  }, [filterPlugins])

 return (
    <Fragment>
      <div id="pluginManager" data-id="pluginManagerComponentPluginManager">
        <header className="form-group mb-0 d-flex flex-column bg-light plugins-header pt-3 pb-2 px-3">
          <div className="pb-3 mb-3 border-bottom w-100">
            <button onClick={openModal} className="btn btn-secondary btn-sm d-flex align-items-center justify-content-center w-100" data-id="pluginManagerComponentConnectButton">
              <i className="fas fa-plug mr-2"></i>
              <FormattedMessage id="pluginManager.connectExternal" defaultMessage="Connect to an external plugin" />
            </button>
          </div>

          <div className="d-flex w-100 mb-2">
            <input
              type="text"
              onChange={(event) => setFilterPlugin(event.target.value.toLowerCase())}
              value={filterPlugins}
              className="form-control form-control-sm"
              placeholder={intl.formatMessage({ id: 'pluginManager.search' })}
              data-id="pluginManagerComponentSearchInput"
            />
            <button onClick={() => setShowFilters(!showFilters)} className="btn btn-sm btn-secondary ml-2" data-id="pluginManagerComponentFilterButton">
               Filters
            </button>
          </div>
          <div className="w-100 d-flex align-items-center">
            <label htmlFor="filter-by-remix-input" className="m-0 text-dark">Only maintained by Remix</label>
            <label className="plugin-manager-switch ml-3">
              <input
                id="filter-by-remix-input"
                type="checkbox"
                checked={filterByRemix}
                onChange={(e) => setFilterByRemix(e.target.checked)}
              />
              <span className="plugin-manager-slider"></span>
            </label>
          </div>
        </header>
        {children}
        <PermisssionsSettings />
      </div>
      <LocalPluginForm closeModal={closeModal} visible={visible} pluginManager={pluginComponent} />
    </Fragment>
  )
}

export default RootView
