import React, { useEffect, useState } from "react";
import { Accordion, Card, Button } from "react-bootstrap";
import axios from "axios";
import { customScriptRunnerConfig, Dependency, ProjectConfiguration } from "../types";
import { FormattedMessage } from "react-intl";
import { faAngleDown, faAngleRight, faCaretDown, faCaretRight, faCheck, faChevronLeft, faChevronUp, faExclamationCircle, faRedoAlt, faToggleOn } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Profile } from "@remixproject/plugin-utils";
import { IframeProfile, ViewProfile } from "@remixproject/engine-web";
import { Plugin } from "@remixproject/engine";
import { CustomScriptRunner } from "./custom-script-runner";
import { CustomTooltip } from "@remix-ui/helper";

export interface ScriptRunnerUIProps {
  // Add your props here
  loadScriptRunner: (config: ProjectConfiguration) => void;
  // build custom script runner
  buildScriptRunner: (dependencies: Dependency[]) => void;
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
  }, [activeKey])

  useEffect(() => {
    if(activeConfig) {
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
                    <li key={depIndex}>
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
          buildScriptRunner={props.buildScriptRunner} />}
    </div>
  );
};


