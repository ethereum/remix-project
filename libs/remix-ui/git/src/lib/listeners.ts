
import { ViewPlugin } from "@remixproject/engine-web";
import React from "react";
import { setCanUseApp, setLoading, setRepoName, setGItHubToken } from "../state/gitpayload";
import { gitActionDispatch } from "../types";
import { diffFiles, getBranches, getFileStatusMatrix, getGitHubUser, getRemotes, gitlog, setPlugin } from "./gitactions";

let plugin: ViewPlugin, gitDispatch: React.Dispatch<gitActionDispatch>, loaderDispatch: React.Dispatch<any>
let callBackEnabled: boolean = false
let syncTimer: NodeJS.Timer = null

export const setCallBacks = (viewPlugin: ViewPlugin, gitDispatcher: React.Dispatch<gitActionDispatch>, loaderDispatcher: React.Dispatch<any>) => {
    plugin = viewPlugin
    gitDispatch = gitDispatcher
    loaderDispatch = loaderDispatcher

    setPlugin(viewPlugin, gitDispatcher)

    plugin.on("fileManager", "fileSaved", async (file: string) => {
        console.log(file)
        loadFiles([file])
        //await synTimerStart();
    });

    plugin.on('dGitProvider', 'checkout' as any, async () => {
        await synTimerStart();
    })
    plugin.on('dGitProvider', 'branch' as any, async () => {
        await synTimerStart();
    })

    plugin.on("fileManager", "fileAdded", async (e) => {
        await synTimerStart();
    });

    plugin.on("fileManager", "fileRemoved", async (e) => {
        await synTimerStart();
    });

    plugin.on("fileManager", "currentFileChanged", async (e) => {
        console.log('current file change', e)
        //await synTimerStart();
    });

    plugin.on("fileManager", "fileRenamed", async (oldfile, newfile) => {
        await synTimerStart();
    });

    plugin.on("filePanel", "setWorkspace", async (x: any) => {
        await synTimerStart();
    });

    plugin.on("filePanel", "deleteWorkspace" as any, async (x: any) => {
        await synTimerStart();
    });

    plugin.on("filePanel", "renameWorkspace" as any, async (x: any) => {
        await synTimerStart();
    });

    plugin.on('dGitProvider', 'checkout', async () => {
        await loadFiles();
    })
    plugin.on('dGitProvider', 'init', async () => {
        await loadFiles();
    })
    plugin.on('dGitProvider', 'add', async () => {
        await loadFiles();
    })
    plugin.on('dGitProvider', 'rm', async () => {
        await loadFiles();
    })
    plugin.on('dGitProvider', 'commit', async () => {
        await loadFiles();
    })
    plugin.on('dGitProvider', 'branch', async () => {
        await loadFiles();
    })
    plugin.on('dGitProvider', 'clone', async () => {
        await loadFiles();
    })
    plugin.on('manager', 'pluginActivated', async (p: Plugin) => {
        if (p.name === 'dGitProvider') {
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

const syncFromWorkspace = async (isLocalhost = false) => {
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
    await loadFiles();
    await enableCallBacks();
}

export const loadFiles = async (filepaths: string[] = null) => {
    //gitDispatch(setLoading(true));

    try {
        await getFileStatusMatrix(filepaths);
    } catch (e) {
        // TODO: handle error
        console.error(e);
    }
    try {
        await gitlog();
    } catch (e) { }
    try {
        await getBranches();
    } catch (e) { }
    try {
        await getRemotes();
    } catch (e) { }
    try {
        //await getStorageUsed();
    } catch (e) { }
    try {
        //await diffFiles('');
    } catch (e) { }
    //gitDispatch(setLoading(false));
}

const getStorageUsed = async () => {
    try {
        const storageUsed = await plugin.call("storage" as any, "getStorage" as any);
    } catch (e) {
        const storage: string = await plugin.call("dGitProvider", "localStorageUsed" as any);
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

const synTimerStart = async () => {
    console.trace('synTimerStart')
    if (!callBackEnabled) return
    clearTimeout(syncTimer)
    syncTimer = setTimeout(async () => {
        await syncFromWorkspace();
    }, 1000)
}
