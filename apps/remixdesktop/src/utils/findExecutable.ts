import path from "path";
import process from "process";
import { Stats } from "fs";
import fs from 'fs/promises'

export async function findExecutable(command: string, cwd?: string, paths?: string[]): Promise<string[]> {
    // If we have an absolute path then we take it.
    if (path.isAbsolute(command)) {
        return [command];
    }
    if (cwd === undefined) {
        cwd = process.cwd();
    }

    
    const dir = path.dirname(command);
    if (dir !== '.') {
        // We have a directory and the directory is relative (see above). Make the path absolute
        // to the current working directory.
        return [path.join(cwd, command)];
    }



    if (paths === undefined && typeof process.env['PATH']  === 'string') {	
        paths = (process &&  process.env['PATH'] && process.env['PATH'].split(path.delimiter)) || [];
    }
    // No PATH environment. Make path absolute to the cwd.
    if (paths === undefined || paths.length === 0) {
        return [];
    }



    async function fileExists(path: string): Promise<boolean> {

        try {
        if (await fs.stat(path)) {
            let statValue: Stats | undefined;
            try {
                statValue = await fs.stat(path);
            } catch (e: any) {
                if (e.message.startsWith('EACCES')) {
                    // it might be symlink
                    statValue = await fs.lstat(path);
                }
            }
           
            return statValue ? !statValue.isDirectory() : false;
        }
        } catch (e) {
        }
        return false;
    }

    // We have a simple file name. We get the path variable from the env
    // and try to find the executable on the path.

    const results = [];

    for (const pathEntry of paths) {

        // The path entry is absolute.
        let fullPath: string;
        if (path.isAbsolute(pathEntry)) {
            fullPath = path.join(pathEntry, command);
        } else {
            fullPath = path.join(cwd, pathEntry, command);
        }
        if (await fileExists(fullPath)) {
            results.push(fullPath);
        }
        let withExtension = fullPath + '.com';
        if (await fileExists(withExtension)) {
            results.push(withExtension);
        }
        withExtension = fullPath + '.exe';
        if (await fileExists(withExtension)) {
            results.push(withExtension);
        }
    }
    if (results.length > 0) {
        return results;
    }
    return [];
}