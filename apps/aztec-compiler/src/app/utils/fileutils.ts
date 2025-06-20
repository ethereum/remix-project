export interface FileInfo {
  path: string;
  isDirectory: boolean;
}

export class FileUtil {
  
  static async allFilesForBrowser(client: any, dirName: string): Promise<FileInfo[]> {
    try {
      let result: FileInfo[] = []
      const files = await client?.fileManager.readdir('browser/' + dirName)
      for (const [key, val] of Object.entries(files)) {
        const file_ = {
          path: key,
          isDirectory: (val as any).isDirectory,
        };
        if (file_.isDirectory) {
          const subDirFiles = (await FileUtil.allFilesForBrowser(client, file_.path)) || []

          result = [...result, file_, ...subDirFiles]
        } else {
          result.push(file_)
        }
      }
      return result
    } catch (e) {
      console.error(e)
      return [];
    }
  }

  static extractFilename(path: string): string {
    const lastIndex = path.lastIndexOf('/')
    if (lastIndex === -1) {
      return path
    }

    return path.slice(lastIndex + 1)
  }

  static extractFilenameWithoutExtension(path: string): string {
    const filename = FileUtil.extractFilename(path)
    return filename.slice(0, filename.lastIndexOf('.'))
  }

  static async contents(fileManager: any, compileTarget: string, projFiles: FileInfo[]) {
    return await Promise.all(
      projFiles.map(async (u) => {
        if (u.isDirectory) {
          return ''
        }
        return await fileManager.readFile('browser/' + compileTarget + '/' + u.path)
      }),
    )
  }
}