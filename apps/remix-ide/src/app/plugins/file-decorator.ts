'use strict'

import { default as deepequal } from 'deep-equal' // eslint-disable-line

import { Plugin } from '@remixproject/engine'
import { fileDecoration } from '@remix-ui/file-decorators'

const profile = {
    name: 'fileDecorator',
    desciption: 'Keeps decorators of the files',
    methods: ['setFileDecorators', 'clearFileDecorators', 'clearAllFileDecorators'],
    events: ['fileDecoratorsChanged'],
    version: '0.0.1'
}

export class FileDecorator extends Plugin {
    private _fileStates: fileDecoration[] = []
    constructor() {
        super(profile)
    }

    onActivation(): void {
        this.on('filePanel', 'setWorkspace', async () => {
            await this.clearAllFileDecorators()
        })
    }

    /**
     * 
     * @param fileStates Array of file states
     */
    async setFileDecorators(fileStates: fileDecoration[] | fileDecoration) {
        const { from } = this.currentRequest
        const workspace = await this.call('filePanel', 'getCurrentWorkspace')
        const fileStatesPayload = Array.isArray(fileStates) ? fileStates : [fileStates]
        // clear all file states in the previous state of this owner on the files called
        fileStatesPayload.forEach((state) => {
            state.workspace = workspace
            state.owner = from
        })
        const filteredState = this._fileStates.filter((state) => {
            const index = fileStatesPayload.findIndex((payloadFileState: fileDecoration) => {
                return from == state.owner && payloadFileState.path == state.path
            })
            return index == -1
        })
        const newState = [...filteredState, ...fileStatesPayload].sort(sortByPath)

        if (!deepequal(newState, this._fileStates)) {
            this._fileStates = newState
            this.emit('fileDecoratorsChanged', this._fileStates)
        }
    }

    async clearFileDecorators(path?: string) {
        const { from } = this.currentRequest
        if (!from) return

        const filteredState = this._fileStates.filter((state) => {
            if(state.owner != from) return true
            if(path && state.path != path) return true
        })
        const newState = [...filteredState].sort(sortByPath)

        if (!deepequal(newState, this._fileStates)) {
            this._fileStates = newState
            this.emit('fileDecoratorsChanged', this._fileStates)
        }

    }

    async clearAllFileDecorators() {
        this._fileStates = []
        this.emit('fileDecoratorsChanged', [])
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