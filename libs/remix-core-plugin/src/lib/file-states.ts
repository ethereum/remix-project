'use strict'

import { default as deepequal } from 'deep-equal' // eslint-disable-line

import { Plugin } from '@remixproject/engine'
import { fileState } from '@remix-ui/file-states'

const profile = {
    name: 'fileStates',
    desciption: 'Keeps state of the files',
    methods: ['setFileState'],
    events: ['fileStateChanged'],
    version: '0.0.1'
}

export class FileStates extends Plugin {
    private _fileStates: fileState[] = []
    constructor() {
        super(profile)
    }
    /**
     * 
     * @param fileStates Array of file states
     */
    async setFileState(fileStates: fileState[] | fileState) {
        const workspace = await this.call('filePanel', 'getCurrentWorkspace')
        function sortByPath( a, b ) {
            if ( a.path < b.path ){
              return -1;
            }
            if ( a.path > b.path ){
              return 1;
            }
            return 0;
          }

        const fileStatesPayload = Array.isArray(fileStates) ? fileStates : [fileStates]
        // clear all file states in the previous state of this owner on the files called
        fileStatesPayload.forEach((state) => {
            state.workspace = workspace
        })
        const filteredState = this._fileStates.filter((state) => {
            const index = fileStatesPayload.findIndex((payloadFileState: fileState) => {
                return payloadFileState.owner == state.owner && payloadFileState.path == state.path
            })
            return index == -1
        })
        const newState = [...filteredState, ...fileStatesPayload].sort(sortByPath)

        if (!deepequal(newState, this._fileStates)) {
            this._fileStates = newState

            console.log('fileStates', this._fileStates)
            this.emit('fileStateChanged', this._fileStates)
        }
    }
}