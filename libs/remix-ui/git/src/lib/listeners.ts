
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
      loadGitHubUserFromToken();
      plugin.off('manager', 'pluginActivated');
    }
  })

  plugin.on('config', 'configChanged', async () => {
    console.log('config changed')
    await getGitConfig()
  })
  plugin.on('settings', 'configChanged', async () => {
    console.log('settings changed')
    await getGitConfig()
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
    console.log('load files', branch)
    if (branch) {
      await getFileStatusMatrix(filepaths);
    } else {
      await plugin.call('fileDecorator', 'clearFileDecorators')
      statusChanged(0)
    }
  } catch (e) {
    // TODO: handle error
    console.error(e);
  }
}

export const disableCallBacks = async () => {
  callBackEnabled = false;
}
export const enableCallBacks = async () => {
  callBackEnabled = true;
}

