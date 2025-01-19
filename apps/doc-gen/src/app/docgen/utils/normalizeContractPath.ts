export function joinPaths(paths: string[]): string {
    if (!paths || paths.length === 0) {
        return '';
    }
    
    let joinedPath = paths[0];
    
    for (let i = 1; i < paths.length; i++) {
        // Add path separator between elements
        joinedPath = `${joinedPath}/${paths[i]}`;
    }
    
    return joinedPath;
}

export function normalizeContractPath(contractPath: string): string {
    const paths = contractPath.split('/');
    return joinPaths(paths);
}
