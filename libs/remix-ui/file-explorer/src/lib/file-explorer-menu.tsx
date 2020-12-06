import React, { useState, useEffect } from 'react' //eslint-disable-line
import { FileExplorerMenuProps } from './types'
import * as helper from '../../../../../apps/remix-ide/src/lib/helper'
import * as async from 'async'
import Gists from 'gists'
import QueryParams from '../../../../../apps/remix-ide/src/lib/query-params'

const queryParams = new QueryParams()

function packageFiles (filesProvider, directory, callback) {
  const ret = {}
  filesProvider.resolveDirectory(directory, (error, files) => {
    if (error) callback(error)
    else {
      async.eachSeries(Object.keys(files), (path, cb) => {
        if (filesProvider.isDirectory(path)) {
          cb()
        } else {
          filesProvider.get(path, (error, content) => {
            if (error) return cb(error)
            if (/^\s+$/.test(content) || !content.length) {
              content = '// this line is added to create a gist. Empty file is not allowed.'
            }
            ret[path] = { content }
            cb()
          })
        }
      }, (error) => {
        callback(error, ret)
      })
    }
  })
}

export const FileExplorerMenu = (props: FileExplorerMenuProps) => {
  const [state, setState] = useState({
    menuItems: [
      {
        action: 'createNewFile',
        title: 'Create New File',
        icon: 'fas fa-plus-circle'
      },
      {
        action: 'publishToGist',
        title: 'Publish all [browser] explorer files to a github gist',
        icon: 'fab fa-github'
      },
      {
        action: 'uploadFile',
        title: 'Add Local file to the Browser Storage Explorer',
        icon: 'far fa-folder-open'
      },
      {
        action: 'updateGist',
        title: 'Update the current [gist] explorer',
        icon: 'fab fa-github'
      }
    ].filter(item => props.menuItems && props.menuItems.find((name) => { return name === item.action })),
    actions: {}
  })

  useEffect(() => {
    const actions = {
      updateGist: () => {},
      uploadFile
    }

    setState(prevState => {
      return { ...prevState, actions }
    })
  }, [])

  const uploadFile = (target) => {
    // TODO The file explorer is merely a view on the current state of
    // the files module. Please ask the user here if they want to overwrite
    // a file and then just use `files.add`. The file explorer will
    // pick that up via the 'fileAdded' event from the files module.

    [...target.files].forEach((file) => {
      const files = props.files

      function loadFile (name: string): void {
        const fileReader = new FileReader()

        fileReader.onload = async function (event) {
          if (helper.checkSpecialChars(file.name)) {
            // modalDialogCustom.alert('Special characters are not allowed')
            return
          }
          const success = await files.set(name, event.target.result)

          if (!success) {
            // modalDialogCustom.alert('Failed to create file ' + name)
          } else {
            props.addFile(props.title, name)
            await props.fileManager.open(name)
          }
        }
        fileReader.readAsText(file)
      }
      const name = files.type + '/' + file.name

      files.exists(name, (error, exist) => {
        if (error) console.log(error)
        if (!exist) {
          loadFile(name)
        } else {
          // modalDialogCustom.confirm('Confirm overwrite', `The file ${name} already exists! Would you like to overwrite it?`, () => { loadFile() })
        }
      })
    })
  }

  const publishToGist = () => {
    // modalDialogCustom.confirm(
    //   'Create a public gist',
    //   'Are you sure you want to publish all your files in browser directory anonymously as a public gist on github.com? Note: this will not include directories.',
    //   () => { this.toGist() }
    toGist()
    // )
  }

  const toGist = (id?: string) => {
    const proccedResult = function (error, data) {
      if (error) {
        // modalDialogCustom.alert('Failed to manage gist: ' + error)
        console.log('Failed to manage gist: ' + error)
      } else {
        if (data.html_url) {
          // modalDialogCustom.confirm('Gist is ready', `The gist is at ${data.html_url}. Would you like to open it in a new window?`, () => {
          // window.open(data.html_url, '_blank')
          // })
        } else {
          // modalDialogCustom.alert(data.message + ' ' + data.documentation_url + ' ' + JSON.stringify(data.errors, null, '\t'))
        }
      }
    }

    /**
       * This function is to get the original content of given gist
       * @params id is the gist id to fetch
       */
    async function getOriginalFiles (id) {
      if (!id) {
        return []
      }

      const url = `https://api.github.com/gists/${id}`
      const res = await fetch(url)
      const data = await res.json()
      return data.files || []
    }

    // If 'id' is not defined, it is not a gist update but a creation so we have to take the files from the browser explorer.
    const folder = id ? 'browser/gists/' + id : 'browser/'
    packageFiles(props.files, folder, (error, packaged) => {
      if (error) {
        console.log(error)
        // modalDialogCustom.alert('Failed to create gist: ' + error.message)
      } else {
        // check for token
        if (!props.accessToken) {
          // modalDialogCustom.alert(
          //   'Remix requires an access token (which includes gists creation permission). Please go to the settings tab to create one.'
          // )
        } else {
          const description = 'Created using remix-ide: Realtime Ethereum Contract Compiler and Runtime. \n Load this file by pasting this gists URL or ID at https://remix.ethereum.org/#version=' +
            queryParams.get().version + '&optimize=' + queryParams.get().optimize + '&runs=' + queryParams.get().runs + '&gist='
          const gists = new Gists({ token: props.accessToken })

          if (id) {
            const originalFileList = getOriginalFiles(id)
            // Telling the GIST API to remove files
            const updatedFileList = Object.keys(packaged)
            const allItems = Object.keys(originalFileList)
              .filter(fileName => updatedFileList.indexOf(fileName) === -1)
              .reduce((acc, deleteFileName) => ({
                ...acc,
                [deleteFileName]: null
              }), originalFileList)
            // adding new files
            updatedFileList.forEach((file) => {
              const _items = file.split('/')
              const _fileName = _items[_items.length - 1]
              allItems[_fileName] = packaged[file]
            })

            // tooltip('Saving gist (' + id + ') ...')
            gists.edit({
              description: description,
              public: true,
              files: allItems,
              id: id
            }, (error, result) => {
              proccedResult(error, result)
              if (!error) {
                for (const key in allItems) {
                  if (allItems[key] === null) delete allItems[key]
                }
              }
            })
          } else {
            // id is not existing, need to create a new gist
            // tooltip('Creating a new gist ...')
            gists.create({
              description: description,
              public: true,
              files: packaged
            }, (error, result) => {
              proccedResult(error, result)
            })
          }
        }
      }
    })
  }

  return (
    <>
      <span className='remixui_label' title={props.title} data-path={props.title} style={{ fontWeight: 'bold' }}>{ props.title }</span>
      <span className="remixui_menu">{
        state.menuItems.map(({ action, title, icon }, index) => {
          if (action === 'uploadFile') {
            return (
              <label
                id={action}
                data-id={'fileExplorerUploadFile' + action }
                className={icon + ' mb-0 remixui_newFile'}
                title={title}
                key={index}
              >
                <input id="fileUpload" data-id="fileExplorerFileUpload" type="file" onChange={(e) => {
                  e.stopPropagation()
                  uploadFile(e.target)
                }}
                multiple />
              </label>
            )
          } else {
            return (
              <span
                id={action}
                data-id={'fileExplorerNewFile' + action}
                onClick={(e) => {
                  e.stopPropagation()
                  if (action === 'createNewFile') {
                    props.createNewFile()
                  } else if (action === 'publishToGist') {
                    publishToGist()
                  } else {
                    state.actions[action]()
                  }
                }}
                className={'newFile ' + icon + ' remixui_newFile'}
                title={title}
                key={index}
              >
              </span>
            )
          }
        })}
      </span>
    </>
  )
}

export default FileExplorerMenu
