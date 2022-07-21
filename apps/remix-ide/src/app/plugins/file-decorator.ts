'use strict'

import { default as deepequal } from 'deep-equal' // eslint-disable-line

import { Plugin } from '@remixproject/engine'
import { fileDecoration } from '@remix-ui/file-decorators'

const profile = {
    name: 'fileDecorator',
    desciption: 'Keeps decorators of the files',
    methods: ['setFileDecorators', 'clearFileDecorators'],
    events: ['fileDecoratorsChanged'],
    version: '0.0.1'
}

export class FileDecorator extends Plugin {
    private _fileStates: fileDecoration[] = []
    constructor() {
        super(profile)
    }


    /**
     * 
     * @param fileStates Array of file states
     */
    async setFileDecorators(fileStates: fileDecoration[] | fileDecoration) {
        const workspace = await this.call('filePanel', 'getCurrentWorkspace')
        const fileStatesPayload = Array.isArray(fileStates) ? fileStates : [fileStates]
        // clear all file states in the previous state of this owner on the files called
        fileStatesPayload.forEach((state) => {
            state.workspace = workspace
        })
        const filteredState = this._fileStates.filter((state) => {
            const index = fileStatesPayload.findIndex((payloadFileState: fileDecoration) => {
                return payloadFileState.owner == state.owner && payloadFileState.path == state.path
            })
            return index == -1
        })
        const newState = [...filteredState, ...fileStatesPayload].sort(sortByPath)

        if (!deepequal(newState, this._fileStates)) {
            this._fileStates = newState
            this.emit('fileDecoratorsChanged', this._fileStates)
        }
    }

    async clearFileDecorators(owner? : string) {
        if(!owner) {
            this._fileStates = []
            this.emit('fileDecoratorsChanged', [])
        } else {
            const filteredState = this._fileStates.filter((state) => {
                return state.owner != owner
            })
            const newState = [...filteredState].sort(sortByPath)
    
            if (!deepequal(newState, this._fileStates)) {
                this._fileStates = newState
                this.emit('fileDecoratorsChanged', this._fileStates)
            }
        }
    }
}

const sortByPath = (a: fileDecoration, b: fileDecoration) => {
    if (a.path < b.path) {
        return -1;
    }
    if (a.path > b.path) {
        return 1;
    }
    return 0;
}