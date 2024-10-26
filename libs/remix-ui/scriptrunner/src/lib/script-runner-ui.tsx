import React, { useEffect, useState } from "react";
import { Accordion, Button } from "react-bootstrap";
import { customScriptRunnerConfig, ProjectConfiguration } from "../types";
import { faCaretDown, faCaretRight, faCheck, faExclamationCircle, faRedoAlt, faToggleOn } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CustomScriptRunner } from "./custom-script-runner";
import { CustomTooltip } from "@remix-ui/helper";

export interface ScriptRunnerUIProps {
  loadScriptRunner: (config: ProjectConfiguration) => void;
  openCustomConfig: () => any;
  saveCustomConfig(content: customScriptRunnerConfig): void;
  activateCustomScriptRunner(config: customScriptRunnerConfig): Promise<string>;
  customConfig: customScriptRunnerConfig;
  configurations: ProjectConfiguration[];
  activeConfig: ProjectConfiguration;
  enableCustomScriptRunner: boolean;
}

export const ScriptRunnerUI = (props: ScriptRunnerUIProps) => {
  const { loadScriptRunner, configurations, activeConfig, enableCustomScriptRunner } = props;
  const [activeKey, setActiveKey] = useState('default');

  useEffect(() => {
    if (activeConfig) {
      setActiveKey(activeConfig.name)
    }
  },[activeConfig])

  if (!configurations) {
    return <div>Loading...</div>;
  }

  return (
    <div className="px-1">
      <Accordion activeKey={activeKey} defaultActiveKey="default">
        {configurations.filter((config) => config.publish).map((config: ProjectConfiguration, index) => (
          <div key={index}>
            <div className="d-flex align-items-baseline justify-content-between">
              <Accordion.Toggle as={Button} variant="link" eventKey={config.name}
                style={{
                  overflowX: 'hidden',
                  textOverflow: 'ellipsis'
                }}
                onClick={() => setActiveKey(activeKey === config.name ? '' : config.name)}
              >
                <div className="d-flex">
                  {activeKey === config.name ?
                    <FontAwesomeIcon icon={faCaretDown}></FontAwesomeIcon> :
                    <FontAwesomeIcon icon={faCaretRight}></FontAwesomeIcon>}
                  <div data-id={`sr-list-${config.name}`} className="pl-2">{config.title || config.name}</div>
                </div>
              </Accordion.Toggle>
              <div className="d-flex align-items-baseline">
                {config.isLoading && <div className="">
                  <i className="fas fa-spinner fa-spin mr-1"></i>
                </div>}
                {config.errorStatus && config.error && <div className="text-danger">
                  <CustomTooltip tooltipText={config.error}>
                    <FontAwesomeIcon data-id={`sr-error-${config.name}`} icon={faExclamationCircle}></FontAwesomeIcon>
                  </CustomTooltip>

                </div>}
                {!config.isLoading && config.errorStatus && config.error &&
                  <div onClick={() => loadScriptRunner(config)} className="pointer px-2">
                    <FontAwesomeIcon data-id={`sr-reload-${config.name}`} icon={faRedoAlt}></FontAwesomeIcon>
                  </div>}
                {!config.isLoading && !config.errorStatus && !config.error &&
                  <div onClick={() => loadScriptRunner(config)} className="pointer px-2">
                    {activeConfig && activeConfig.name !== config.name ?
                      <FontAwesomeIcon data-id={`sr-toggle-${config.name}`} icon={faToggleOn}></FontAwesomeIcon> :
                      <FontAwesomeIcon data-id={`sr-loaded-${config.name}`} className="text-success" icon={faCheck}></FontAwesomeIcon>
                    }
                  </div>
                }
              </div>
            </div>

            <Accordion.Collapse className="px-4" eventKey={config.name}>
              <>
                <p><strong>Description: </strong>{config.description}</p>
                <p><strong>Dependencies:</strong></p>
                <ul>
                  {config.dependencies.map((dep, depIndex) => (
                    <li data-id={`dependency-${dep.name}-${dep.version}`} key={depIndex}>
                      <strong>{dep.name}</strong> (v{dep.version})
                    </li>
                  ))}
                </ul></>
            </Accordion.Collapse></div>))}
      </Accordion>
      {enableCustomScriptRunner &&
        <CustomScriptRunner
          customConfig={props.customConfig}
          activateCustomScriptRunner={props.activateCustomScriptRunner}
          saveCustomConfig={props.saveCustomConfig}
          openCustomConfig={props.openCustomConfig}
          publishedConfigurations={configurations.filter((config) => config.publish)}
        />}
    </div>
  );
};

