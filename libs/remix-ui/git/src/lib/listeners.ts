
import React from "react";
import { setCanUseApp, setLoading, setRepoName, setGItHubToken, setLog, setGitHubUser, setUserEmails } from "../state/gitpayload";
import { gitActionDispatch } from "../types";
import { Plugin } from "@remixproject/engine";
import { getBranches, getFileStatusMatrix, loadGitHubUserFromToken, getRemotes, gitlog, setPlugin } from "./gitactions";
import { Profile } from "@remixproject/plugin-utils";
import { CustomRemixApi } from "@remix-api";
import { statusChanged } from "./pluginActions";

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

    const timer = setTimeout(async () => {
      await callback();
      this.queues.delete(callback);
    }, customDelay || this.delay);

    this.queues.set(callback, { timer, lastCall: Date.now() });
  }
}

export const setCallBacks = (viewPlugin: Plugin, gitDispatcher: React.Dispatch<gitActionDispatch>, loaderDispatcher: React.Dispatch<any>, setAtivePanel: React.Dispatch<React.SetStateAction<string>>) => {
  plugin = viewPlugin
  gitDispatch = gitDispatcher
  loaderDispatch = loaderDispatcher
  loadFileQueue = new AsyncDebouncedQueue()

  setPlugin(viewPlugin, gitDispatcher)

  plugin.on("fileManager", "fileSaved", async (file: string) => {
    loadFileQueue.enqueue(async () => {
      loadFiles()
    })
  });

  plugin.on("fileManager", "fileAdded", async (e) => {
    loadFileQueue.enqueue(async () => {
      loadFiles()
    })
  });

  plugin.on("fileManager", "fileRemoved", async (e) => {
    loadFileQueue.enqueue(async () => {
      loadFiles()
    })
  });

  plugin.on("fileManager", "fileRenamed", async (oldfile, newfile) => {
    loadFileQueue.enqueue(async () => {
      loadFiles()
    })
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

  plugin.on('dgitApi', 'checkout', async () => {
    loadFileQueue.enqueue(async () => {
      gitlog()
    })
    loadFileQueue.enqueue(async () => {
      getBranches()
    })
    gitDispatch(setLog({
      message: "Checkout",
      type: "success"
    }))
  })
  plugin.on('dgitApi', 'init', async () => {
    loadFileQueue.enqueue(async () => {
      loadFiles()
    }, 10)
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
    loadFileQueue.enqueue(async () => {
      getBranches()
    }, 20)
    gitDispatch(setLog({
      message: 'Committed changes...',
      type: 'success'
    }))
  })
  plugin.on('dgitApi', 'branch', async () => {
    loadFileQueue.enqueue(async () => {
      gitlog()
    })
    loadFileQueue.enqueue(async () => {
      getBranches()
    })
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
      loadGitHubUserFromToken();
      plugin.off('manager', 'pluginActivated');
    }
  })

  plugin.on('config', 'configChanged', async () => {
    await getGitConfig()
  })
  plugin.on('settings', 'configChanged', async () => {
    await getGitConfig()
  })

  plugin.on('dgit' as any, 'openPanel', async (panel: string) => {
    const panels = {
      'branches': '2'
    }
    const panelNumber = panels[panel]
    setAtivePanel(panelNumber)
  })

  callBackEnabled = true;
}

export const getGitConfig = async () => {
  const username = await plugin.call('settings', 'get', 'settings/github-user-name')
  const email = await plugin.call('settings', 'get', 'settings/github-email')
  const token = await plugin.call('settings', 'get', 'settings/gist-access-token')
  const config = { username, email, token }

  loadGitHubUserFromToken()
  return

}

export const loadFiles = async (filepaths: string[] = null) => {
  try {
    const branch = await plugin.call('dgitApi', "currentbranch")
    if (branch) {
      await getFileStatusMatrix(filepaths);
    } else {
      await plugin.call('fileDecorator', 'clearFileDecorators')
      statusChanged(0)
    }
  } catch (e) {
    console.error(e);
  }
}

export const disableCallBacks = async () => {
  callBackEnabled = false;
}
export const enableCallBacks = async () => {
  callBackEnabled = true;
}

