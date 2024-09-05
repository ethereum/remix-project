import { exec } from 'child_process';
import { CommitObject, ReadCommitResult } from 'isomorphic-git';
import { promisify } from 'util';
import { cloneInputType, commitInputType, fetchInputType, pullInputType, pushInputType, checkoutInputType } from "@remix-api";
const execAsync = promisify(exec);

const statusTransFormMatrix = (status: string) => {
    switch (status) {
        case '??':
            return [0, 2, 0]
        case 'A ':
            return [0, 2, 2]
        case 'R ':
            return [0, 2, 2]
        case 'M ':
            return [1, 2, 2]
        case 'MM':
            return [1, 2, 3]
        case ' M':
            return [1, 2, 1]
        case 'AD':
            return [0, 0, 3]
        case ' D':
            return [1, 0, 1]
        case 'D ':
            return [1, 0, 0]
        case 'AM':
            return [0, 2, 3]
        default:
            return [-1, -1, -1]
    }
}

export const gitProxy = {

    version: async () => {
        try {
            const result = await execAsync('git --version');
            return result.stdout
        } catch (error) {
            return false;
        }
    },

    async defaultRemoteName(path: string) {
        try {
            const { stdout } = await execAsync('git remote', { cwd: path });
            const remotes = stdout.trim().split('\n');
            return remotes[0];
        } catch (error) {
            throw new Error(`Failed to get the default remote name: ${error.message}`);
        }
    },


    clone: async (input: cloneInputType) => {
        const { stdout, stderr } = await execAsync(`git clone ${input.url} "${input.dir}"`);
    },

    async push(path: string, input: pushInputType) {
        if(!input.remote || !input.remote.name) {
            input.remote = { name:  await gitProxy.defaultRemoteName(path), url: '' }
        }
        let remoteRefString = ''
        if(input.remoteRef && !input.remoteRef.name) {
            remoteRefString = `:${input.remoteRef.name}`
        }
        const { stdout, stderr } = await execAsync(`git push  ${input.force ? ' -f' : ''}  ${input.remote.name}${remoteRefString} ${input.ref.name}`, { cwd: path });
    },

    async pull(path: string, input: pullInputType) {
        if(!input.remote || !input.remote.name) {
            input.remote = { name:  await gitProxy.defaultRemoteName(path), url: '' }
        }
        let remoteRefString = ''
        if(input.remoteRef && !input.remoteRef.name) {
            remoteRefString = `:${input.remoteRef.name}`
        }
        const { stdout, stderr } = await execAsync(`git pull ${input.remote.name} ${input.ref.name}${remoteRefString}`, { cwd: path });
    },

    async fetch(path: string, input: fetchInputType) {
        if(!input.remote || !input.remote.name) {
            input.remote = { name:  await gitProxy.defaultRemoteName(path), url: '' }
        }

        try {
            const { stdout, stderr } = await execAsync(`git fetch ${input.remote.name} ${(input.ref && input.ref.name) ? input.ref.name : ''}`, { cwd: path });
            if (stdout) {
                console.log('stdout:', stdout);
            }
            if (stderr) {
                console.error('stderr:', stderr);
            }
        } catch (error) {
            console.error('Error during fetch:', error);
        }
    },

    async checkout(path: string, input: checkoutInputType) {
        let force = input.force ? ' -f' : '';
        const { stdout, stderr } = await execAsync(`git checkout ${force} ${input.ref}`, { cwd: path });
    },

    async commit(path: string, input: commitInputType) {

        await execAsync(`git commit -m '${input.message}'`, { cwd: path });
        const { stdout, stderr } = await execAsync(`git rev-parse HEAD`, { cwd: path });
        console.log('stdout commit:', stdout);
        return stdout;

    },

    async init(path: string) {
        await execAsync(`git init --initial-branch=main`, { cwd: path });
    },

    async updateSubmodules(path: string) {
        const { stdout, stderr } = await execAsync(`git submodule update --init --recursive`, { cwd: path });
        if (stdout) {
            console.log('stdout:', stdout);
        }
        if (stderr) {
            console.error('stderr:', stderr);
        }
    },


    status: async (path: string) => {
        const result = await execAsync('git status --porcelain -uall', { cwd: path })
        //console.log('git status --porcelain -uall', result.stdout)
        // parse the result.stdout
        const lines = result.stdout.split('\n')
        const files: any = []
        const fileNames: any = []
        //console.log('lines', lines)
        lines.forEach((line: string) => {
            // get the first two characters of the line
            const status = line.slice(0, 2)

            const file = line.split(' ').pop()

            //console.log('line', line)
            if (status && file) {
                fileNames.push(file)
                files.push([
                    file,
                    ...statusTransFormMatrix(status)
                ])
            }
        }
        )
        // sort files by first column
        files.sort((a: any, b: any) => {
            if (a[0] < b[0]) {
                return -1
            }
            if (a[0] > b[0]) {
                return 1
            }
            return 0
        })

        console.log('files', files)
        return files
    },


    // buggy, doesn't work properly yet on windows
    log: async (path: string, ref: string) => {
        const result = await execAsync('git log ' + ref + ' --pretty=format:"{ oid:%H,  message:"%s", author:"%an", email: "%ae", timestamp:"%at", tree: "%T", committer: "%cn", committer-email: "%ce", committer-timestamp: "%ct", parent: "%P" }" -n 20', { cwd: path })
        console.log('git log', result.stdout)
        const lines = result.stdout.split('\n')
        const commits: ReadCommitResult[] = []
        console.log('lines', lines)
        lines.forEach((line: string) => {
            console.log('line', normalizeJson(line))
            line = normalizeJson(line)
            const data = JSON.parse(line)
            let commit: ReadCommitResult = {} as ReadCommitResult
            commit.oid = data.oid
            commit.commit = {} as CommitObject
            commit.commit.message = data.message
            commit.commit.tree = data.tree
            commit.commit.committer = {} as any
            commit.commit.committer.name = data.committer
            commit.commit.committer.email = data['committer-email']
            commit.commit.committer.timestamp = data['committer-timestamp']
            commit.commit.author = {} as any
            commit.commit.author.name = data.author
            commit.commit.author.email = data.email
            commit.commit.author.timestamp = data.timestamp
            commit.commit.parent = [data.parent]
            console.log('commit', commit)
            commits.push(commit)

        })

        return commits

    }
}

function normalizeJson(str: string) {
    return str.replace(/[\s\n\r\t]/gs, '').replace(/,([}\]])/gs, '$1')
        .replace(/([,{\[]|)(?:("|'|)([\w_\- ]+)\2:|)("|'|)(.*?)\4([,}\]])/gs, (str, start, q1, index, q2, item, end) => {
            item = item.replace(/"/gsi, '').trim();
            if (index) { index = '"' + index.replace(/"/gsi, '').trim() + '"'; }
            if (!item.match(/^[0-9]+(\.[0-9]+|)$/) && !['true', 'false'].includes(item)) { item = '"' + item + '"'; }
            if (index) { return start + index + ':' + item + end; }
            return start + item + end;
        });
}
