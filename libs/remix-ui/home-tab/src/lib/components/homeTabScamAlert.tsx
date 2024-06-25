/* eslint-disable @typescript-eslint/no-unused-vars */
import { appPlatformTypes, platformContext } from '@remix-ui/app'
import React, { useContext } from 'react'
import { FormattedMessage } from 'react-intl'

const _paq = (window._paq = window._paq || []) // eslint-disable-line

function HomeTabScamAlert() {
  const platform = useContext(platformContext)
  return (
    <div className="" id="hTScamAlertSection">
      <label className="pl-2 text-danger" style={{ fontSize: '1.2rem' }}>
        <FormattedMessage id="home.scamAlert" />
      </label>
      <div className="py-2 ml-2 mb-1 align-self-end mb-2 d-flex  border border-danger">
        <span className="align-self-center pl-4 mt-1">
          <i style={{ fontSize: 'xxx-large', fontWeight: 'lighter' }} className="pr-2 text-danger far fa-exclamation-triangle"></i>
        </span>
        <div className="d-flex flex-column">
          {platform === appPlatformTypes.web && (
            <span className="pl-4 mt-1">
              <FormattedMessage id="home.scamAlertText" />
            </span>)}
          <span className="pl-4 mt-1">
            <FormattedMessage id="home.scamAlertText2" />:
            <a
              className="pl-2 remixui_home_text"
              onClick={() => _paq.push(['trackEvent', 'hometab', 'scamAlert', 'learnMore'])}
              target="__blank"
              href="https://medium.com/remix-ide/remix-in-youtube-crypto-scams-71c338da32d"
            >
              <FormattedMessage id="home.learnMore" />
            </a>
          </span>
          <span className="pl-4 mt-1">
            <FormattedMessage id="home.scamAlertText3" />: &nbsp;
            <a
              className="remixui_home_text"
              onClick={() => _paq.push(['trackEvent', 'hometab', 'scamAlert', 'safetyTips'])}
              target="__blank"
              href="https://remix-ide.readthedocs.io/en/latest/security.html"
            >
              <FormattedMessage id="home.here" />
            </a>
          </span>
        </div>
      </div>
    </div>
  )
}

export default HomeTabScamAlert
