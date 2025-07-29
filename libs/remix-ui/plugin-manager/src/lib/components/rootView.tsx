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
  // 필터 영역 표시 여부를 위한 상태
  const [showFilters, setShowFilters] = useState<boolean>(false)

  const openModal = () => setVisible(false)
  const closeModal = () => setVisible(true)

  useEffect(() => {
    // 필터링 로직은 여기에 추가될 것입니다. 지금은 검색만 유지합니다.
    pluginComponent.getAndFilterPlugins(filterPlugins)
  }, [filterPlugins])

 return (
    <Fragment>
      <div id="pluginManager" data-id="pluginManagerComponentPluginManager">
        <header className="form-group mb-0 d-flex flex-column bg-light plugins-header pt-3 pb-2 px-3">
          {/* 7. Connect 버튼 아래에 구분선 추가 */}
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
            {/* 2. 필터 버튼 배경색 변경 (btn-secondary 사용) */}
            <button onClick={() => setShowFilters(!showFilters)} className="btn btn-sm btn-secondary ml-2" data-id="pluginManagerComponentFilterButton">
               Filters
            </button>
          </div>
          
          {/* 1. 필터와 상관없이 항상 보이도록 위치 변경 */}
          <div className="w-100 d-flex align-items-center">
            <label htmlFor="filter-by-remix-input" className="m-0 text-dark">Only maintained by Remix</label>
            {/* 3. 커스텀 토글 디자인 적용 */}
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
