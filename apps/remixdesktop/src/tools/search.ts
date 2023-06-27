import { exec } from 'child_process';
import { CommitObject, ReadCommitResult } from 'isomorphic-git';
import { promisify } from 'util';
import { rgPath } from '@vscode/ripgrep';

const rgDiskPath = rgPath.replace(/\bnode_modules\.asar\b/, 'node_modules.asar.unpacked');

const execAsync = promisify(exec);


export const searchProxy = {
    checkIfGrepIsInstalled: async () => {
        try {
            const result = await execAsync('grep --version');
            console.log('grep --version', result.stdout)
            return result.stdout
        } catch (error) {
            return false;
        }
    },

    checkIffindstrIsInstalled: async () => {
        try {
            const result = await execAsync('findstr /?');
            console.log('findstr /?', result.stdout)
            return result.stdout
        } catch (error) {
            return false;
        }
    },

    checkIfSelectStringIsInstalled: async () => {
        try {
            const result = await execAsync('get-help Select-String');
            console.log('get-help Select-String', result.stdout)
            return result.stdout
        } catch (error) {
            return false;
        }
    },

    checkIfRgIsInstalled: async () => {
        try {

            const result = await execAsync(`${rgDiskPath} 'remix' ./`, { cwd: process.cwd(), env: { PATH: process.env.PATH }});
            console.log('rg --version', result.stdout)
            return result.stdout
        } catch (error) {
            return false;
        }
    }



}