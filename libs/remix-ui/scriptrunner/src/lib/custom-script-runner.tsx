import React, { useEffect, useState } from "react";
import { Accordion, Card, Button } from "react-bootstrap";
import axios from "axios";
import { customScriptRunnerConfig, Dependency, ProjectConfiguration } from "../types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

export interface ScriptRunnerUIProps {
    // build custom script runner
    buildScriptRunner: (dependencies: Dependency[]) => void;
    publishedConfigurations: ProjectConfiguration[];
    loadCustomConfig: () => any;
    saveCustomConfig(content: customScriptRunnerConfig): void;
    activateCustomScriptRunner(config: customScriptRunnerConfig): string;
    addCustomConfig(config: ProjectConfiguration) : void;
}

export const CustomScriptRunner = (props: ScriptRunnerUIProps) => {
    const [dependencies, setDependencies] = useState<Dependency[]>([]);
    const [name, setName] = useState<string>('');
    const [alias, setAlias] = useState<string>('');
    const [version, setVersion] = useState<string>('');
    const [baseConfig, setBaseConfig] = useState<string>('default');
    const [loading, setLoading] = useState<boolean>(false);

    const handleAddDependency = () => {
        if (name.trim() && version.trim()) {
            const newDependency: Dependency = { name, version, import: true, alias };
            setDependencies([...dependencies, newDependency]);
            setName('');
            setVersion('');
        } else {
            alert('Please fill out both name and version.');
        }
    };

    const handleRemoveDependency = (index: number) => {
        const updatedDependencies = dependencies.filter((_, i) => i !== index);
        setDependencies(updatedDependencies);
    };

    const handleSaveToFile = () => {
        const fileData = JSON.stringify(dependencies, null, 2);
        console.log(fileData, baseConfig);
        const customConfig: customScriptRunnerConfig = { baseConfiguration: baseConfig, dependencies };
        console.log(customConfig);
        props.saveCustomConfig(customConfig);
    };

    const loadFromFile = async () => {
        const fileData: customScriptRunnerConfig = await props.loadCustomConfig();
        console.log(fileData);
        setDependencies(fileData.dependencies);
        setBaseConfig(fileData.baseConfiguration);
    }

    const activateCustomConfig = async () => {
        console.log('activate');
        const customConfig: customScriptRunnerConfig = { baseConfiguration: baseConfig, dependencies };
        console.log(customConfig);
        setLoading(true);
        const loadedConfig = await props.activateCustomScriptRunner(customConfig);
        console.log(loadedConfig);
        const newConfig: ProjectConfiguration = {
            name: loadedConfig,
            publish: true,
            description: `Extension of ${baseConfig}`,
            dependencies: dependencies,
            replacements: {}
        };
        console.log(newConfig);
        props.addCustomConfig(newConfig);
        setLoading(false);
    }

    const onSelectBaseConfig = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setBaseConfig(e.target.value);
    }

    if (loading) {
        return <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
            <div className="text-center py-5">
                <i className="fas fa-spinner fa-pulse fa-2x"></i>
            </div>
        </div>
    }

    return (
        <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
            <h5>Custom configuration</h5>
            <label>Select a base configuration</label>
            <select value={baseConfig} className="form-control" onChange={onSelectBaseConfig} style={{ marginBottom: '10px' }}>
                <option value="none">Select a base configuration</option>
                {props.publishedConfigurations.map((config: ProjectConfiguration, index) => (
                    <option key={index} value={config.name}>
                        {config.name}
                    </option>
                ))}
            </select>
            <label>Add dependencies</label>
            <div style={{ marginBottom: '10px' }}>
                <input
                    type="text"
                    placeholder="Dependency Name"
                    value={name}
                    className="form-control"
                    onChange={(e) => setName(e.target.value)}
                    style={{ marginRight: '10px' }}
                />
                <input
                    type="text"
                    placeholder="Alias"
                    className="form-control mt-1"
                    value={alias}
                    onChange={(e) => setAlias(e.target.value)} />
                <input
                    type="text"
                    placeholder="Version"
                    className="form-control mt-1"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                />
                <button
                    className="btn btn-primary w-100 mt-1"
                    onClick={handleAddDependency}>
                    Add
                </button>
            </div>
            <ul>
                {dependencies.map((dependency, index) => (
                    <li key={index} style={{ marginBottom: '5px' }}>
                        <div className="d-flex align-items-baseline justify-content-between">
                        {dependency.name} - {dependency.version}
                        <button
                            onClick={() => handleRemoveDependency(index)}
                            className="btn btn-danger"
                            style={{ marginLeft: '10px' }}
                        >
                            <FontAwesomeIcon icon={faTrash} />
                        </button>
                        </div>
                    </li>
                ))}
            </ul>
            {dependencies.length > 0 && (
                <button className="btn btn-primary w-100" onClick={handleSaveToFile} style={{ marginTop: '20px' }}>
                    Save List to File
                </button>
            )}
            <button className="btn btn-primary w-100" onClick={loadFromFile} style={{ marginTop: '20px' }}>
                Load from File
            </button>
            {dependencies.length > 0 && (
            <button className="btn btn-success w-100" onClick={activateCustomConfig} style={{ marginTop: '20px' }}>
                Activate
            </button>)}
        </div>
    );
}