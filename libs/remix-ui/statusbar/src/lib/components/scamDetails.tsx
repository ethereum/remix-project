import { ExtendedRefs, ReferenceType } from '@floating-ui/react'
import React, { CSSProperties } from 'react'
import { FormattedMessage } from 'react-intl'
import { ScamAlert } from '../remixui-statusbar-panel'
import '../../css/statusbar.css'

const _paq = (window._paq = window._paq || []) // eslint-disable-line

export interface ScamDetailsProps {
  refs: ExtendedRefs<ReferenceType>
  floatStyle: CSSProperties
  getFloatingProps: (userProps?: React.HTMLProps<HTMLElement> | undefined) => Record<string, unknown>
  scamAlerts: ScamAlert[]
}

export default function ScamDetails ({ refs, floatStyle, scamAlerts }: ScamDetailsProps) {

  return (
    <div
      ref={refs.setFloating}
      style={ floatStyle }
      className="px-1 ml-1 mb-1 d-flex w-25 alert alert-danger border border-danger"
    >
      <span className="align-self-center pl-4 mt-1">
        <i style={{ fontSize: 'xxx-large', fontWeight: 'lighter' }} className="pr-2 far text-danger fa-exclamation-triangle"></i>
      </span>
      <div className="d-flex flex-column text-danger">
        {scamAlerts && scamAlerts.map((alert, index) => (
          <span className="pl-4 mt-1" key={`${alert.url}${index}`}>
            {alert.url.length < 1 ? <FormattedMessage id={`home.scamAlertText${index + 1}`} defaultMessage={alert.message} />
              : (<><FormattedMessage id={`home.scamAlertText${index + 1}`} defaultMessage={alert.message} /> : &nbsp;
                <a
                  className={`remixui_home_text text-decoration-none ${index === 1 ? 'pl-2' : ''}`}
                  onClick={() => {
                    index === 1 && _paq.push(['trackEvent', 'hometab', 'scamAlert', 'learnMore'])
                    index === 2 && _paq.push(['trackEvent', 'hometab', 'scamAlert', 'safetyTips'])
                  }}
                  target="__blank"
                  href={scamAlerts[index].url}
                >
                  <FormattedMessage id="home.here" defaultMessage={scamAlerts[index].message} />
                </a></>)}
          </span>
        ))}
      </div>
    </div>
  )
}
