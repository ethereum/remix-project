import React, { useEffect, useState } from "react";
import { Accordion, Button } from "react-bootstrap";
import { customScriptRunnerConfig, ProjectConfiguration } from "../types";
import { faCaretDown, faCaretRight, faCheck, faExclamationCircle, faRedoAlt, faToggleOn } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CustomScriptRunner } from "./custom-script-runner";
import { CustomTooltip } from "@remix-ui/helper";
import ConfigSection from "./components/config-section";
const _paq = (window._paq = window._paq || []) // eslint-disable-line

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
    <div className="px-5">
      <div className="d-flex flex-column justify-content-between mt-4">
        <div className="text-uppercase mb-3 text-dark h2" style={{ fontSize: 'x-large' }}>script configuration</div>
        <div className="text-uppercase text-dark h3" style={{ fontSize: 'large' }}>choose a specific configuration for your script</div>
      </div>
      <div className="mt-3 d-flex flex-column gap-3 mb-4">
        {configurations.filter((config) => config.publish).map((config: ProjectConfiguration, index) => (
          <ConfigSection
            activeKey={activeKey}
            setActiveKey={setActiveKey}
            config={config}
            key={index}
            loadScriptRunner={loadScriptRunner}
            _paq={_paq}
            activeConfig={activeConfig}
          />
        ))}
      </div>
      {enableCustomScriptRunner &&
        <CustomScriptRunner
          customConfig={props.customConfig}
          activateCustomScriptRunner={props.activateCustomScriptRunner}
          saveCustomConfig={props.saveCustomConfig}
          openCustomConfig={props.openCustomConfig}
          publishedConfigurations={configurations.filter((config) => config.publish)}
        />}
    </div>
  )
}

