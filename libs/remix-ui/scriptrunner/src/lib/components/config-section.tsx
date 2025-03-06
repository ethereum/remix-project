import React, { useEffect, useRef, useState } from 'react'
import { FormattedMessage } from 'react-intl'
import { ProjectConfiguration } from '../../types';
import { faCheck, faTimes, faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CustomTooltip } from '@remix-ui/helper';

export interface ConfigSectionProps {
  _paq: any;
  activeKey: string
  setActiveKey: (key: string) => void
  config: ProjectConfiguration
  key: number
  loadScriptRunner: (config: ProjectConfiguration) => void
  activeConfig: ProjectConfiguration
}

export default function ConfigSection(props: ConfigSectionProps) {
  const [isVisible, setIsVisible] = useState(true)

  const handleAnimationEnd = () => {
    setIsVisible(false);
  }

  const SectionHeader = () => {

    return (
      <section className="mr-1">
        <div className="custom-control custom-radio">
          <input
            className="custom-control-input"
            type="radio"
            name="scriptrunner-config-radio"
            value={props.config.name}
            id={props.config.title || props.config.name}
            onChange={() => {
              props.setActiveKey(props.config.name)
              props.loadScriptRunner(props.config)
              props._paq.push(['trackEvent', 'scriptRunnerPlugin', 'loadScriptRunnerConfig', props.config.name])
            }}
            checked={props.activeKey === props.config.name}
          />
          <label className="form-check-label custom-control-label" htmlFor={`${props.config.title || props.config.name}`}
            data-id={`sr-load-${props.config.name}`}>
            <div data-id={`sr-loaded-${props.config.name}`} className="pl-2">{props.config.title || props.config.name}</div>
          </label>
        </div>
      </section>
    )
  }

  const Dependencies = () => {
    const [showAll, setShowAll] = useState(false);
    const visibleDeps = showAll ? props.config.dependencies : props.config.dependencies.slice(0, 4);
    const hasMore = props.config.dependencies.length > 4;

    return (
      <>
        {visibleDeps.map((dep, depIndex) => (
          <li className="p-1 text-secondary" data-id={`dependency-${dep.name}-${dep.version}`} key={depIndex}>
            {dep.name} (v{dep.version})
          </li>
        ))}
        {hasMore && (
          <li>
            <a
              href="#"
              className="text-primary text-decoration-none"
              onClick={(e) => {
                e.preventDefault();
                setShowAll(!showAll);
              }}
            >
              {showAll ? 'Show less' : 'Show more'}
              <FontAwesomeIcon icon={showAll ? faCaretUp : faCaretDown} className="ml-1" />
            </a>
          </li>
        )}
      </>
    )
  }

  return (
    <section className="mb-2">
      <section className="d-flex flex-row ">
        <SectionHeader />
        <div>
          {!props.config.isLoading && !props.config.errorStatus && !props.config.error &&
          <div onClick={() => props.loadScriptRunner(props.config)} className="pointer px-2 pb-1">
            { props.activeConfig && props.activeConfig.name === props.config.name &&
              <div className={`${!isVisible ? 'd-flex flex-row align-items-center justify-content-center pt-1' : 'd-flex flex-row pb-1 align-items-center justify-content-center'}`}>
                <FontAwesomeIcon data-id={`sr-loaded-${props.config.name}`} className="text-success ml-3" icon={faCheck}></FontAwesomeIcon>
                {isVisible && <span onAnimationEnd={handleAnimationEnd} className="text-success px-3" style={{ animation: 'fadeOut 5s forwards', animationFillMode: 'forwards' }}>Config loaded</span>}
              </div>
            }
          </div>
          }
        </div>
        {props.config.isLoading && <div className="d-flex flex-row mx-4">
          <div className="d-flex flex-row pb-1 align-items-center justify-content-center">
            <i className="fas fa-spinner fa-spin"></i><span className='pl-3'>Loading config</span>
          </div>
        </div>}
        <div className="ml-4 d-flex" id="errorSection">
          {props.config.errorStatus && props.config.error && <div className="text-danger">
            <CustomTooltip tooltipText={props.config.error}>
              <FontAwesomeIcon data-id={`sr-error-${props.config.name}`} icon={faTimes}></FontAwesomeIcon>
            </CustomTooltip>

          </div>}
          {!props.config.isLoading && props.config.errorStatus && props.config.error &&
            <div
              onClick={() => {
                props.loadScriptRunner(props.config)
                props._paq.push(['trackEvent', 'scriptRunnerPlugin', 'error_reloadScriptRunnerConfig', props.config.name])
              }}
              className="pointer px-2 text-danger d-flex flex-row"
            >
              <span className="pr-1 text-danger font-weight-bold">Loading error</span>
              <span className="text-danger">We are not able to load your requested configuration for now, please try again later.</span>
            </div>
          }
        </div>
      </section>

      <section className="d-flex flex-column w-100">
        <div className="mt-2 mb-4 bg-dark p-3 ">
          <p className="text-dark text-monospace">{props.config.description}</p>
          <p className="text-dark">Dependencies</p>
          <ul className="list-unstyled ">
            <Dependencies />
          </ul>
        </div>
      </section>
    </section>
  )
}
