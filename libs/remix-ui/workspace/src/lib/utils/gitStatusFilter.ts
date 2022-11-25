const FILE = 0, HEAD = 1, WORKDIR = 2, STAGE = 3

export const getUncommittedFiles = (statusMatrix: Array<Array<string | number>>) => {
    statusMatrix = statusMatrix.filter(row => (row[HEAD] !== row[WORKDIR]) || (row[HEAD] !== row[STAGE]))
    const uncommitedFiles = statusMatrix.map(row => row[FILE])

    return uncommitedFiles
}