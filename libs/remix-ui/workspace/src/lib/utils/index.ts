import { appPlatformTypes } from '@remix-ui/app'
import { FileType } from '@remix-ui/file-decorators'
import { WorkspaceProps, MenuItems } from '../types'

export const contextMenuActions: MenuItems = [{
  id: 'newFile',
  name: 'New File',
  type: ['folder', 'gist', 'workspace'],
  multiselect: false,
  label: '',
  group: 0
}, {
  id: 'newFolder',
  name: 'New Folder',
  type: ['folder', 'gist', 'workspace'],
  multiselect: false,
  label: '',
  group: 0
}, {
  id: 'rename',
  name: 'Rename',
  type: ['file', 'folder'],
  multiselect: false,
  label: '',
  group: 0
}, {
  id: 'delete',
  name: 'Delete',
  type: ['file', 'folder', 'gist'],
  multiselect: false,
  label: '',
  group: 0
},{
  id: 'deleteAll',
  name: 'Delete All',
  type: ['folder', 'file'],
  multiselect: true,
  label: '',
  group: 0
}, {
  id: 'copy',
  name: 'Copy',
  type: ['folder', 'file'],
  multiselect: false,
  label: '',
  group: 1
}, {
  id: 'copyFileName',
  name: 'Copy name',
  type: ['file'],
  multiselect: false,
  label: '',
  group: 1
}, {
  id: 'copyFilePath',
  name: 'Copy path',
  type: ['file'],
  multiselect: false,
  label: '',
  group: 1
}, {
  id: 'download',
  name: 'Download',
  type: ['file', 'folder', 'workspace'],
  multiselect: false,
  label: '',
  group: 2,
  platform: appPlatformTypes.web
}, {
  id: 'run',
  name: 'Run',
  extension: ['.js', '.ts'],
  multiselect: false,
  label: '',
  group: 3
},{
  id: 'pushChangesToGist',
  name: 'Push changes to gist',
  type: ['gist'],
  multiselect: false,
  label: '',
  group: 4,
  platform: appPlatformTypes.web
}, {
  id: 'publishFolderToGist',
  name: 'Publish folder to gist',
  type: ['folder'],
  multiselect: false,
  label: '',
  group: 4,
  platform: appPlatformTypes.web
}, {
  id: 'publishFileToGist',
  name: 'Publish file to gist',
  type: ['file'],
  multiselect: false,
  label: '',
  group: 4,
  platform: appPlatformTypes.web
}, {
  id: 'uploadFile',
  name: 'Load a Local File',
  type: ['folder', 'gist', 'workspace'],
  multiselect: false,
  label: 'Load a Local File',
  group: 4,
  platform: appPlatformTypes.web
}, {
  id: 'publishToGist',
  name: 'Push changes to gist',
  type: ['folder', 'gist'],
  multiselect: false,
  label: 'Publish all to Gist',
  group: 4,
  platform: appPlatformTypes.web
},
{
  id: 'publishWorkspace',
  name: 'Publish Workspace to Gist',
  type: ['workspace'],
  multiselect: false,
  label: '',
  group: 4,
  platform: appPlatformTypes.web
}]

export const fileKeySort = (fileTree: any) => {
  const directories = Object.keys(fileTree).filter((key: string) => fileTree[key].isDirectory)

  // sort case insensitive
  directories.sort((a: string, b: string) => a.toLowerCase().localeCompare(b.toLowerCase()))

  const fileKeys = Object.keys(fileTree).filter((key: string) => !fileTree[key].isDirectory)
  // sort case insensitive
  fileKeys.sort((a: string, b: string) => a.toLowerCase().localeCompare(b.toLowerCase()))

  // find the children with a blank name
  //const blankChildren = Object.keys(children).filter((key: string) => children[key].name === '')

  const keys = [...directories, ...fileKeys]
  console.log('sorted keys', keys)
  // rebuild the fileTree using the keys
  const newFileTree = {}
  keys.forEach((key: string) => {
    newFileTree[key] = fileTree[key]
  })
  return newFileTree
}
