import React, { useEffect, useState } from "react";
import { Accordion, Card, Button } from "react-bootstrap";
import axios from "axios";
import { customScriptRunnerConfig, Dependency, ProjectConfiguration } from "../types";
import { FormattedMessage } from "react-intl";
import { faCheck, faToggleOn } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Profile } from "@remixproject/plugin-utils";
import { IframeProfile, ViewProfile } from "@remixproject/engine-web";
import { Plugin } from "@remixproject/engine";
import { CustomScriptRunner } from "./custom-script-runner";

export interface ScriptRunnerUIProps {
  // Add your props here
  loadScriptRunner: (name: string) => void;
  // build custom script runner
  buildScriptRunner: (dependencies: Dependency[]) => void;
  openCustomConfig: () => any;
  saveCustomConfig(content: customScriptRunnerConfig): void;
  activateCustomScriptRunner(config: customScriptRunnerConfig): string;
  customConfig: customScriptRunnerConfig;
  configurations: ProjectConfiguration[];
}

export const ScriptRunnerUI = (props: ScriptRunnerUIProps) => {
  const { loadScriptRunner, configurations } = props;
  const [activeKey, setActiveKey] = useState('default');
  const [activeConfig, setActiveConfig] = useState('default');

  useEffect(() => {
    // Fetch the JSON data from the localhost server using Axios

  }, []); // Empty array ensures this effect runs once when the component mounts

  const handleSelect = (key) => {
    console.log("Selected key:", key, activeKey);
    setActiveConfig(key);
    console.log(loadScriptRunner)
    loadScriptRunner(key)
  };

  const addCustomConfig = (config: ProjectConfiguration) => {
    if(configurations.find((c) => c.name === config.name)) {
      return;
    }
    //setConfigurations([...configurations, config]);
    setActiveConfig(config.name);
  }

  if (!configurations) {
    return <div>Loading...</div>;
  }


  return (
    <div className="px-1">
      <Accordion defaultActiveKey="default">
        {configurations.filter((config) => config.publish).map((config: ProjectConfiguration, index) => (
          <div key={index}>
            <div className="d-flex align-items-baseline justify-content-between">
              <Accordion.Toggle as={Button} variant="link" eventKey={config.name}
                style={{
                  overflowX: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                <div className="pl-2">{config.name}</div>
              </Accordion.Toggle>
              <div onClick={() => handleSelect(config.name)} className="pointer px-2">
                {activeConfig !== config.name ?
                  <FontAwesomeIcon icon={faToggleOn}></FontAwesomeIcon> :
                  <FontAwesomeIcon className="text-success" icon={faCheck}></FontAwesomeIcon>
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
      <CustomScriptRunner
        customConfig={props.customConfig}
        addCustomConfig={addCustomConfig}
        activateCustomScriptRunner={props.activateCustomScriptRunner}
        saveCustomConfig={props.saveCustomConfig}
        openCustomConfig={props.openCustomConfig}
        publishedConfigurations={configurations.filter((config) => config.publish)}
        buildScriptRunner={props.buildScriptRunner} />
    </div>
  );
};


