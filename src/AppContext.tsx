import React from "react";
import {
  PluginApi,
  IRemixApi,
  Api,
  PluginClient,
  CompilationResult,
} from "@remixproject/plugin";

import { ContractName, Documentation, PublishedSite } from "./types";

export const AppContext = React.createContext({
  clientInstance: {} as PluginApi<Readonly<IRemixApi>> &
    PluginClient<Api, Readonly<IRemixApi>>,
  contracts: new Map<ContractName, Documentation>(),
  setContracts: (contracts: Map<ContractName, Documentation>) => {
    console.log("Calling Set Contract Names");
  },
  sites: [],
  setSites: (sites: PublishedSite[]) => {
    console.log("Calling Set Sites");
  },
});
