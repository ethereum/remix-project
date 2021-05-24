import React from "react";
import { PluginClient } from "@remixproject/plugin";
import { PluginApi, Api } from "@remixproject/plugin-utils";
import { IRemixApi } from "@remixproject/plugin-api";

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
  themeType: "dark",
});
