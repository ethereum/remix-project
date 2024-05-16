import { ExtendedRefs, ReferenceType } from '@floating-ui/react'
import React, { CSSProperties } from 'react'
import { FormattedMessage } from 'react-intl'

const _paq = (window._paq = window._paq || []) // eslint-disable-line

export interface ScamDetailsProps {
  refs: ExtendedRefs<ReferenceType>
  floatStyle: CSSProperties
  getFloatingProps: (userProps?: React.HTMLProps<HTMLElement> | undefined) => Record<string, unknown>
}

export default function ScamDetails ({ refs, floatStyle }: ScamDetailsProps) {
  return (
    <div
      ref={refs.setFloating}
      style={floatStyle}
      className="py-2 ml-2 mb-1 align-self-end mb-2 d-flex w-25 bg-danger border border-danger align-items-end"
    >
      <span className="align-self-center pl-4 mt-1">
        <i style={{ fontSize: 'xxx-large', fontWeight: 'lighter' }} className="pr-2 text-warning far fa-exclamation-triangle"></i>
      </span>
      <div className="d-flex flex-column">
        <span className="pl-4 mt-1">
          <FormattedMessage id="home.scamAlertText" />
        </span>
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
  )
}
