import path from 'path'
import fs from 'fs'

export const convertPathToPosix = (pathName: string): string => {
  if (!pathName) return ''
  return pathName.split(path.sep).join(path.posix.sep)
}

export const convertPathToLocalFileSystem = (pathName: string): string => {
  if (!pathName) return ''
  return pathName.split(path.posix.sep).join(path.sep)
}

export const getBaseName = (pathName: string): string => {
  if (!pathName) return ''
  return path.basename(pathName)
}

/**
 * Check if a file is within a directory (or its subdirectories)
 * and return the relative path of the file with the directory as the base.
 * @param filePath - The full file path
 * @param dirPath - The directory path
 * @param ALLOWED_EXTENSIONS - An array of allowed file extensions
 * @returns The relative path if the file is inside the directory, otherwise null
 */
export function getRelativePath(filePath: string, dirPath: string, ALLOWED_EXTENSIONS: string[] = []): string | null {
  if (!filePath || !dirPath) return null
  console.log('filePath:', filePath)
  console.log('dirPath:', dirPath)
  // Normalize paths for consistent comparison
  const normalizedFilePath = path.resolve(filePath)
  const normalizedDirPath = path.resolve(dirPath)

  // Check if the file path starts with the directory path
  if (!normalizedFilePath.startsWith(normalizedDirPath)) {
    return null
  }

  // Check if the file actually exists and is a file
  if (!fs.existsSync(normalizedFilePath) || !fs.statSync(normalizedFilePath).isFile()) {
    return null
  }

  if (!ALLOWED_EXTENSIONS && ALLOWED_EXTENSIONS.length > 0) {
    // Validate the file extension
    const fileExtension = path.extname(normalizedFilePath).toLowerCase()
    if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
      return null
    }
  }

  // Return the relative path
  return path.relative(normalizedDirPath, normalizedFilePath)
}


/**
 * Check if the focused file is already open.
 * @param focusedFile - The focused file path
 * @param openedFiles - Object containing the opened files
 * @returns True if the file is open, otherwise false
 */
export function isFocusedFileOpen(focusedFile: string, openedFiles: Record<string, string>): boolean {
  // Normalize the focused file path for consistent comparison
  const normalizedFocusedFile = path.normalize(focusedFile);

  // Normalize all opened file paths and check if any match the focused file
  return Object.keys(openedFiles).some((file) => path.normalize(file) === normalizedFocusedFile);
}
