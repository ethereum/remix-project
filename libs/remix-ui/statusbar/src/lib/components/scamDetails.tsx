import { ExtendedRefs, ReferenceType } from '@floating-ui/react'
import React, { CSSProperties } from 'react'
import { FormattedMessage } from 'react-intl'
import { ScamAlert } from '../remixui-statusbar-panel'

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
      style={floatStyle}
      className="py-2 ml-1 mb-1 mb-2 d-flex w-25 bg-danger border border-danger"
    >
      <span className="align-self-center pl-4 mt-1">
        <i style={{ fontSize: 'xxx-large', fontWeight: 'lighter', color: 'orange' }} className="pr-2 far fa-exclamation-triangle"></i>
      </span>
      <div className="d-flex flex-column text-white">
        {scamAlerts && scamAlerts.map((alert, index) => (
          <span className="pl-4 mt-1">
            {alert.url.length < 1 ? <FormattedMessage id={`home.scamAlertText${index + 1}`} defaultMessage={alert.message} />
              : (<><FormattedMessage id={`home.scamAlertText${index + 1}`} defaultMessage={alert.message} /> : &nbsp;
                <a
                  className={`remixui_home_text text-white ${index === 1 ? 'pl-2' : ''}`}
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
