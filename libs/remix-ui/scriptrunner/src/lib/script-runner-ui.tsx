import React, { useEffect, useState } from "react";
import { Accordion, Card, Button } from "react-bootstrap";
import axios from "axios";
import { ProjectConfiguration } from "./types";
import { FormattedMessage } from "react-intl";
import { faCheck, faToggleOn } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Profile } from "@remixproject/plugin-utils";
import { IframeProfile, ViewProfile } from "@remixproject/engine-web";
import { Plugin } from "@remixproject/engine";

export interface ScriptRunnerUIProps {
  // Add your props here
  loadScriptRunner: (name: string) => void;
}

export const ScriptRunnerUI = (props: ScriptRunnerUIProps) => {
  const { loadScriptRunner } = props;
  const [configurations, setConfigurations] = useState([]);
  const [activeKey, setActiveKey] = useState('default');
  const [activeConfig, setActiveConfig] = useState('default');

  useEffect(() => {
    // Fetch the JSON data from the localhost server using Axios
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:3000/projects.json?timestamp=' + Date.now());
        setConfigurations(response.data);
      } catch (error) {
        console.error("Error fetching the projects data:", error);
      }
    };

    fetchData();
  }, []); // Empty array ensures this effect runs once when the component mounts

  const handleSelect = (key) => {
    console.log("Selected key:", key, activeKey);
    setActiveConfig(key);
    console.log(loadScriptRunner)
    loadScriptRunner(key)
  };

  // Filter out unpublished configurations
  const publishedConfigurations = configurations.filter((config) => config.publish);

  return (
    <div className="px-1">
      <Accordion defaultActiveKey="default">
        {publishedConfigurations.map((config: ProjectConfiguration, index) => (
          <div key={index}>
            <div className="d-flex align-items-baseline justify-content-between">
              <Accordion.Toggle as={Button} variant="link" eventKey={config.name}>
                <span className="pl-2">{config.name}</span>
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

    </div>
  );
};


