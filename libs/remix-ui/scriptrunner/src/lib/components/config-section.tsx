import React, { useEffect, useState } from 'react'
import { FormattedMessage } from 'react-intl'
import { ProjectConfiguration } from '../../types';
import { faCheck, faExclamationCircle, faRedoAlt, faToggleOn, faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons';
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
  console.log(props)

  const SectionHeader = () => {
    const [configRadio, setConfigRadio] = useState(props.activeKey === props.activeConfig.name)
    return (
      <section className="">
        <div className="custom-control custom-radio">
          <input
            className="custom-control-input"
            type="radio"
            name="script-runner-radio-section"
            value={props.config.name}
            onChange={() => {
              props.setActiveKey(props.config.name)
              // setConfigRadio(true)
              // props.setActiveKey(props.config.name)
              // props.loadScriptRunner(props.config)
              // props._paq.push(['trackEvent', 'scriptRunnerPlugin', 'loadScriptRunnerConfig', props.config.name])
            }}
            checked={props.activeKey === props.config.name}
            id={`${props.config.name}-radio-section`}
          />
          <label className="form-check-label custom-control-label" htmlFor={`${props.config.name}-radio-section-label`}
            data-id={`sr-list-${props.config.name}`}>
            <FormattedMessage
              id="scriptrunnerui.defaultSection"
              defaultMessage={props.config.title || props.config.name}
              description={props.config.title || props.config.name}
              values={{ configName: () => props.config.title || props.config.name }} />
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
    <section className="mb-4">
      <SectionHeader />
      <div className="d-flex flex-column">
        {props.config.isLoading && <div className="">
          <i className="fas fa-spinner fa-spin mr-1"></i>
        </div>}
        {props.config.errorStatus && props.config.error && <div className="text-danger">
          <CustomTooltip tooltipText={props.config.error}>
            <FontAwesomeIcon data-id={`sr-error-${props.config.name}`} icon={faExclamationCircle}></FontAwesomeIcon>
          </CustomTooltip>

        </div>}
        {!props.config.isLoading && props.config.errorStatus && props.config.error &&
            <div
              onClick={() => {
                props.loadScriptRunner(props.config)
                props._paq.push(['trackEvent', 'scriptRunnerPlugin', 'loadScriptRunnerConfig', props.config.name])
              }}
              className="pointer px-2"
            >
              <FontAwesomeIcon data-id={`sr-reload-${props.config.name}`} icon={faRedoAlt}></FontAwesomeIcon>
            </div>
        }
      </div>
      <section className="d-flex flex-column" style={{ width: '100%' }} >
        <div className="mt-4 bg-light p-3 ">
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
