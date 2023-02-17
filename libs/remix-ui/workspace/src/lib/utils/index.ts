import { WorkspaceProps, MenuItems } from '../types'

export const contextMenuActions: MenuItems = [{
  id: 'newFile',
  name: 'New File',
  type: ['folder', 'gist', 'workspace'],
  multiselect: false,
  label: ''
}, {
  id: 'newFolder',
  name: 'New Folder',
  type: ['folder', 'gist', 'workspace'],
  multiselect: false,
  label: ''
}, {
  id: 'rename',
  name: 'Rename',
  type: ['file', 'folder'],
  multiselect: false,
  label: ''
}, {
  id: 'delete',
  name: 'Delete',
  type: ['file', 'folder', 'gist'],
  multiselect: false,
  label: ''
},{
  id: 'download',
  name: 'Download',
  type: ['file', 'folder', 'workspace'],
  multiselect: false,
  label: ''
}, {
  id: 'run',
  name: 'Run',
  extension: ['.js', '.ts'],
  multiselect: false,
  label: ''
},{
  id: 'pushChangesToGist',
  name: 'Push changes to gist',
  type: ['gist'],
  multiselect: false,
  label: ''
}, {
  id: 'publishFolderToGist',
  name: 'Publish folder to gist',
  type: ['folder'],
  multiselect: false,
  label: ''
}, {
  id: 'publishFileToGist',
  name: 'Publish file to gist',
  type: ['file'],
  multiselect: false,
  label: ''
}, {
  id: 'copy',
  name: 'Copy',
  type: ['folder', 'file'],
  multiselect: false,
  label: ''
}, {
  id: 'copyFileName',
  name: 'Copy name',
  type: ['file'],
  multiselect: false,
  label: ''
}, {
  id: 'copyFilePath',
  name: 'Copy path',
  type: ['file'],
  multiselect: false,
  label: ''
}, {
  id: 'deleteAll',
  name: 'Delete All',
  type: ['folder', 'file'],
  multiselect: true,
  label: ''
},{
  id: 'uploadFile',
  name: 'Load a Local File',
  type: ['folder', 'gist', 'workspace'],
  multiselect: false,
  label: 'Load a Local File'
}, {
  id: 'publishToGist',
  name: 'Push changes to gist',
  type: ['folder', 'gist'],
  multiselect: false,
  label: 'Publish all to Gist'
},
{
  id: 'publishWorkspace',
  name: 'Publish Workspace to Gist',
  type: ['workspace'],
  multiselect: false,
  label: ''
}]