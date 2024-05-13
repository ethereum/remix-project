
import React from "react";
import { setCanUseApp, setLoading, setRepoName, setGItHubToken, setLog } from "../state/gitpayload";
import { gitActionDispatch } from "../types";
import { Plugin } from "@remixproject/engine";
import { getBranches, getFileStatusMatrix, getGitHubUser, getRemotes, gitlog, setPlugin } from "./gitactions";
import { Profile } from "@remixproject/plugin-utils";
import { CustomRemixApi } from "@remix-api";

let plugin: Plugin<any, CustomRemixApi>, gitDispatch: React.Dispatch<gitActionDispatch>, loaderDispatch: React.Dispatch<any>, loadFileQueue: AsyncDebouncedQueue
let callBackEnabled: boolean = false

type AsyncCallback = () => Promise<void>;

class AsyncDebouncedQueue {
    private queues: Map<AsyncCallback, { timer: any, lastCall: number }>;

    constructor(private delay: number = 300) {
        this.queues = new Map();
    }

    enqueue(callback: AsyncCallback, customDelay?:number): void {
        if (this.queues.has(callback)) {
            clearTimeout(this.queues.get(callback)!.timer);
        }

        let timer = setTimeout(async () => {
            await callback(); 
            this.queues.delete(callback);
        }, customDelay || this.delay);

        this.queues.set(callback, { timer, lastCall: Date.now() });
    }
}



export const setCallBacks = (viewPlugin: Plugin, gitDispatcher: React.Dispatch<gitActionDispatch>, loaderDispatcher: React.Dispatch<any>) => {
  plugin = viewPlugin
  gitDispatch = gitDispatcher
  loaderDispatch = loaderDispatcher
  loadFileQueue = new AsyncDebouncedQueue()

  setPlugin(viewPlugin, gitDispatcher)

  plugin.on("fileManager", "fileSaved", async (file: string) => {
    console.log(file)
    loadFileQueue.enqueue(async () => {
      loadFiles()
    })
  });

  plugin.on('dgitApi', 'checkout', async () => {
    //await synTimerStart();
  })
  plugin.on('dgitApi', 'branch', async () => {
    //await synTimerStart();
  })

  plugin.on("fileManager", "fileAdded", async (e) => {
    loadFileQueue.enqueue(async () => {
      loadFiles()
    })
  });

  plugin.on("fileManager", "fileRemoved", async (e) => {
    //await synTimerStart();
  });

  plugin.on("fileManager", "currentFileChanged", async (e) => {
    console.log('current file change', e)
    //await synTimerStart();
  });

  plugin.on("fileManager", "fileRenamed", async (oldfile, newfile) => {
    //await synTimerStart();
  });

  plugin.on("filePanel", "setWorkspace", async (x: any) => {
    loadFileQueue.enqueue(async () => {
      loadFiles()
    })
    loadFileQueue.enqueue(async () => {
      gitlog()
    })
    loadFileQueue.enqueue(async () => {
      getBranches()
    })
    loadFileQueue.enqueue(async () => {
      getRemotes()
    })
  });

  plugin.on("filePanel", "deleteWorkspace" as any, async (x: any) => {
    //await synTimerStart();
  });

  plugin.on("filePanel", "renameWorkspace" as any, async (x: any) => {
    //await synTimerStart();
  });

  plugin.on('dgitApi', 'checkout', async () => {
   
  })
  plugin.on('dgitApi', 'init', async () => {
    
  })
  plugin.on('dgitApi', 'add', async () => {
    loadFileQueue.enqueue(async () => {
      loadFiles()
    }, 10)
  })
  plugin.on('dgitApi', 'rm', async () => {
    loadFileQueue.enqueue(async () => {
      loadFiles()
    }, 10)
  })
  plugin.on('dgitApi', 'commit', async () => {
    loadFileQueue.enqueue(async () => {
      gitlog()
    }, 10)
    gitDispatch(setLog({
      message: 'Committed changes...',
      type: 'success'
    }))
  })
  plugin.on('dgitApi', 'branch', async () => {
    gitDispatch(setLog({
      message: "Created Branch",
      type: "success"
    }))
  })
  plugin.on('dgitApi', 'clone', async () => {
    gitDispatch(setLog({
      message: "Cloned Repository",
      type: "success"
    }))
    loadFileQueue.enqueue(async () => {
      loadFiles()
    })
  })
  plugin.on('manager', 'pluginActivated', async (p: Profile<any>) => {
    if (p.name === 'dgitApi') {
      getGitHubUser();
      plugin.off('manager', 'pluginActivated');
    }
  })

  plugin.on('config', 'configChanged', async () => {
    await getGitConfig()
  })
  plugin.on('settings', 'configChanged', async () => {
    await getGitConfig()
  })

  callBackEnabled = true;
}

export const getGitConfig = async () => {
  const username = await plugin.call('settings', 'get', 'settings/github-user-name')
  const email = await plugin.call('settings', 'get', 'settings/github-email')
  const token = await plugin.call('settings', 'get', 'settings/gist-access-token')
  const config = { username, email, token }
  gitDispatch(setGItHubToken(config.token))
  return config
}

const syncFromWorkspace = async (callback: Function, isLocalhost = false) => {
  //gitDispatch(setLoading(true));
  await disableCallBacks();
  if (isLocalhost) {
    gitDispatch(setCanUseApp(false));
    gitDispatch(setLoading(false));
    await enableCallBacks();
    return;
  }
  try {
    const workspace = await plugin.call(
      "filePanel",
      "getCurrentWorkspace"
    );
    if (workspace.isLocalhost) {
      gitDispatch(setCanUseApp(false));
      await enableCallBacks();
      return
    }

    gitDispatch(setRepoName(workspace.name));
    gitDispatch(setCanUseApp(true));
  } catch (e) {
    gitDispatch(setCanUseApp(false));
  }
  await callback();
  await enableCallBacks();
}

export const loadFiles = async (filepaths: string[] = null) => {
  try {
    await getFileStatusMatrix(filepaths);
  } catch (e) {
    // TODO: handle error
    console.error(e);
  }
}

const getStorageUsed = async () => {
  try {
    const storageUsed = await plugin.call("storage" as any, "getStorage" as any);
  } catch (e) {
    const storage: string = await plugin.call('dgitApi', "localStorageUsed" as any);
    const storageUsed = {
      usage: parseFloat(storage) * 1000,
      quota: 10000000,
    };
  }
}

export const disableCallBacks = async () => {
  callBackEnabled = false;
}
export const enableCallBacks = async () => {
  callBackEnabled = true;
}

