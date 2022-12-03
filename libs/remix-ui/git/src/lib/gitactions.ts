import { ViewPlugin } from "@remixproject/engine-web";
import { ReadCommitResult } from "isomorphic-git";
import React from "react";
import { fileStatus, setBranches, setCommits, setLoading } from "../state/payload";
import { gitActionDispatch, statusMatrixType } from '../types';
import { removeSlash } from "../utils";
import { disableCallBacks, enableCallBacks } from "./listeners";

export const fileStatuses = [
    ["new,untracked", 0, 2, 0], // new, untracked
    ["added,staged", 0, 2, 2], //
    ["added,staged,with unstaged changes", 0, 2, 3], // added, staged, with unstaged changes
    ["unmodified", 1, 1, 1], // unmodified
    ["modified,unstaged", 1, 2, 1], // modified, unstaged
    ["modified,staged", 1, 2, 2], // modified, staged
    ["modified,staged,with unstaged changes", 1, 2, 3], // modified, staged, with unstaged changes
    ["deleted,unstaged", 1, 0, 1], // deleted, unstaged
    ["deleted,staged", 1, 0, 0],
    //["deleted", 1, 1, 0], // deleted, staged
    ["unmodified", 1, 1, 3],
    ["deleted,not in git", 0, 0, 3],
    ["unstaged,modified", 1, 2, 0]
];

const statusmatrix: statusMatrixType[] = fileStatuses.map((x: any) => {
    return {
        matrix: x.shift().split(","),
        status: x,
    };
});

let plugin: ViewPlugin, dispatch: React.Dispatch<gitActionDispatch>


export const setPlugin = (p: ViewPlugin, dispatcher: React.Dispatch<gitActionDispatch>) => {
    plugin = p
    dispatch = dispatcher
}

export const getBranches = async () => {
    const branches = await plugin.call("dGitProvider", "branches");
    dispatch(setBranches(branches));
}
export const getRemotes = async () => {
    await plugin.call("dGitProvider", "remotes" as any);
}

export const getFileStatusMatrix = async () => {
    const fileStatusResult = await statusMatrix();
    fileStatusResult.map((m) => {
        statusmatrix.map((sm) => {
            if (JSON.stringify(sm.status) === JSON.stringify(m.status)) {
                //Utils.log(m, sm);
                m.statusNames = sm.matrix;
            }
        });
    });
    console.log(fileStatusResult);
    dispatch(fileStatus(fileStatusResult));
}



export const getCommits = async () => {
    //Utils.log("get commits");
    try {
        const commits: ReadCommitResult[] = await plugin.call(
            "dGitProvider",
            "log",
            { ref: "HEAD" }
        );
        return commits;
    } catch (e) {
        return [];
    }
}

export const gitlog = async () => {
    let commits = []
    try {
        commits = await getCommits();
    } catch (e) {
    }
    dispatch(setCommits(commits));
    await showCurrentBranch();
}

export const showCurrentBranch = async () => {
    try {
        let branch = await currentBranch();
        const currentcommitoid = await getCommitFromRef("HEAD");


        if (typeof branch === "undefined" || branch === "") {
            //toast.warn(`You are in a detached state`);
            branch = `HEAD detached at ${currentcommitoid}`;
            //canCommit = false;
        } else {
            //canCommit = true;
        }
    } catch (e) {
        // show empty branch
    }
}

export const currentBranch = async () => {
    // eslint-disable-next-line no-useless-catch
    try {
        const branch: string =
            (await plugin.call("dGitProvider", "currentbranch")) || "";
        return branch;
    } catch (e) {
        throw e;
    }
}

export const createBranch = async (name: string = "") => {
    if (name) {
        await plugin.call("dGitProvider", "branch", { ref: name });
        await plugin.call("dGitProvider", "checkout", { ref: name });
    }
}

export const getCommitFromRef = async (ref: string) => {
    const commitOid = await plugin.call("dGitProvider", "resolveref", {
        ref: ref,
    });
    return commitOid;
}

const settingsWarning = async () => {
    const username = await plugin.call('config' as any, 'getAppParameter', 'settings/github-user-name')
    const email = await plugin.call('config' as any, 'getAppParameter', 'settings/github-email')
    if (!username || !email) {
        plugin.call('notification', 'toast', 'Please set your github username and email in the settings')
        return false;
    } else {
        return {
            username,
            email
        };
    }
}

export const commit = async (message: string = "") => {

    try {
        const credentials = await settingsWarning()
        if (!credentials) {
            dispatch(setLoading(false))
            return
        }

        const sha = await plugin.call("dGitProvider", "commit", {
            author: {
                name: credentials.username,
                email: credentials.email,
            },
            message: message,
        });
        plugin.call('notification', 'toast', `Commited: ${sha}`)

    } catch (err) {
        plugin.call('notification', 'toast', `${err}`)
    }

}

export const addall = async () => {
    try {
        await plugin
            .call("dGitProvider", "status", { ref: "HEAD" })
            .then((status) =>
                Promise.all(
                    status.map(([filepath, , worktreeStatus]) =>
                        worktreeStatus
                            ? plugin.call("dGitProvider", "add", {
                                filepath: removeSlash(filepath),
                            })
                            : plugin.call("dGitProvider", "rm", {
                                filepath: removeSlash(filepath),
                            })
                    )
                )
            );
        plugin.call('notification', 'toast', `Added all files to git`)

    } catch (e) {
        plugin.call('notification', 'toast', `${e}`)
    }
}

export const add = async (args: string | undefined) => {
    if (args !== undefined) {
        let filename = args; // $(args[0].currentTarget).data('file')
        let stagingfiles;
        if (filename !== "/") {
            filename = removeSlash(filename);
            stagingfiles = [filename];
        } else {
            await addall();
            return;
        }
        try {
            for (const filepath of stagingfiles) {
                try {
                    await plugin.call("dGitProvider", "add", {
                        filepath: removeSlash(filepath),
                    });
                } catch (e) { }
            }
            plugin.call('notification', 'toast', `Added ${filename} to git`);
        } catch (e) {
            plugin.call('notification', 'toast', `${e}`)
        }
    }
}


const getLastCommmit = async () => {
    try {
        let currentcommitoid = "";
        currentcommitoid = await getCommitFromRef("HEAD");
        return currentcommitoid;
    } catch (e) {
        return false;
    }
}


export const rm = async (args: any) => {
    const filename = args;
    await plugin.call("dGitProvider", "rm", {
        filepath: removeSlash(filename),
    });
    plugin.call('notification', 'toast', `Removed ${filename} from git`)
}


export const checkoutfile = async (filename: string) => {
    const oid = await getLastCommmit();
    if (oid)
        try {
            const commitOid = await plugin.call("dGitProvider", "resolveref", {
                ref: oid,
            });
            const { blob } = await plugin.call("dGitProvider", "readblob", {
                oid: commitOid,
                filepath: removeSlash(filename),
            });
            const original = Buffer.from(blob).toString("utf8");
            //(original, filename);
            await disableCallBacks();
            await plugin.call(
                "fileManager",
                "setFile",
                removeSlash(filename),
                original
            );
            await enableCallBacks();
        } catch (e) {
            plugin.call('notification', 'toast', `No such file`)
        }
}

export const checkout = async (cmd: any) => {
    await disableCallBacks();
    await plugin.call('fileManager', 'closeAllFiles')
    try {
        await plugin.call("dGitProvider", "checkout", cmd);
        gitlog();
    } catch (e) {
        plugin.call('notification', 'toast', `${e}`)
    }
    await enableCallBacks();
}


export const statusMatrix = async () => {
    const matrix = await plugin.call("dGitProvider", "status", { ref: "HEAD" });
    const result = (matrix || []).map((x) => {
        return {
            filename: `/${x.shift()}`,
            status: x,
        };
    });
    return result;
}

export const diffFiles = async (filename: string | undefined) => {

}
