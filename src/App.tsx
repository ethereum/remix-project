import React, { useState, useEffect, useRef } from "react";

import { PluginClient } from "@remixproject/plugin";
import { createClient } from "@remixproject/plugin-webview";
import {
  CompilationFileSources,
  CompilationResult,
} from "@remixproject/plugin-api/";
import { Status } from "@remixproject/plugin-utils";

import { AppContext } from "./AppContext";
import { Routes } from "./routes";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { createDocumentation } from "./utils/utils";

import "./App.css";
import { ContractName, Documentation } from "./types";

export const getNewContractNames = (compilationResult: CompilationResult) => {
  const compiledContracts = compilationResult.contracts;
  let result: string[] = [];

  for (const file of Object.keys(compiledContracts)) {
    const newContractNames = Object.keys(compiledContracts[file]);
    result = [...result, ...newContractNames];
  }

  return result;
};

const sampleMap = new Map<ContractName, Documentation>();

const App = () => {
  const [clientInstance, setClientInstance] = useState(undefined as any);
  const [contracts, setContracts] = useState(sampleMap);
  const [sites, setSites] = useLocalStorage("sites", []);
  const clientInstanceRef = useRef(clientInstance);
  clientInstanceRef.current = clientInstance;
  const contractsRef = useRef(contracts);
  contractsRef.current = contracts;

  useEffect(() => {
    console.log("Remix EthDoc loading...");
    const client = createClient(new PluginClient());
    const loadClient = async () => {
      await client.onload();
      setClientInstance(client);
      console.log("Remix EthDoc Plugin has been loaded");
      //await client.call("manager" as any, "activatePlugin", "ethdoc-viewer");
      client.solidity.on(
        "compilationFinished",
        (
          fileName: string,
          source: CompilationFileSources,
          languageVersion: string,
          data: CompilationResult
        ) => {
          console.log("New compilation received");

          const existingMap = contractsRef.current;
          const newContractsMapWithDocumentation = createDocumentation(
            fileName,
            data
          );
          const newMap = new Map([
            ...existingMap,
            ...newContractsMapWithDocumentation,
          ]);

          const status: Status = {
            key: "succeed",
            type: "success",
            title: "New documentation ready",
          };
          clientInstanceRef.current.emit("statusChanged", status);
          setContracts(newMap);
        }
      );
    };

    loadClient();
  }, []);

  return (
    <AppContext.Provider
      value={{
        clientInstance,
        contracts,
        setContracts,
        sites,
        setSites,
      }}
    >
      <Routes />
    </AppContext.Provider>
  );
};

export default App;
