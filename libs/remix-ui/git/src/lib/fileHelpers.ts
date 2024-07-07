import { fileStatusResult, gitState } from "../types";

export const getFilesCountByStatus = (status: string, files: fileStatusResult[]) => {
  let count = 0;

  files.map((m) => {
    if (m.statusNames !== undefined) {
      if (m.statusNames && m.statusNames.indexOf(status) > -1) {
        count++;
      }
    }
  });
  return count;
}

export const getFilesByStatus = (status: string, files: fileStatusResult[]): fileStatusResult[] => {
  const result: fileStatusResult[] = []
  files.map((m) => {
    if (m.statusNames !== undefined) {
      if (m.statusNames && m.statusNames.indexOf(status) > -1) {
        result.push(m)
      }
    }
  });
  return result;
}

export const getFilesWithNotModifiedStatus = (files: fileStatusResult[]): fileStatusResult[] => {
  const result: fileStatusResult[] = []

  files.map((m) => {

    if (m.statusNames !== undefined) {
      if (m.statusNames && m.statusNames.indexOf("unmodified") === -1) {
        result.push(m)
      }
    }
  });
  return result;
}

export const allChangedButNotStagedFiles = (files: fileStatusResult[]): fileStatusResult[] => {
  let allfiles = getFilesWithNotModifiedStatus(files)
  const staged = getFilesByStatus("staged", files)
  allfiles = allfiles.filter((trackedFile) => {
    return staged.findIndex((stagedFile) => stagedFile.filename === trackedFile.filename) === -1
  })
  return allfiles;
}

export const getFileStatusForFile = (filename: string, files: fileStatusResult[]) => {
  for (let i: number = 0; i < files.length; i++) {
    if (files[i].filename === filename)
      return files[i].statusNames;
  }
}