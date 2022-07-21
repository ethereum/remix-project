'use strict'

import { default as deepequal } from 'deep-equal' // eslint-disable-line

import { Plugin } from '@remixproject/engine'
import { fileDecoration } from '@remix-ui/file-decorators'

const profile = {
    name: 'fileDecorator',
    desciption: 'Keeps decorators of the files',
<<<<<<< HEAD
    methods: ['setFileDecorators', 'clearFileDecorators', 'clearAllFileDecorators'],
=======
    methods: ['setFileDecorators', 'clearFileDecorators'],
>>>>>>> 43bc1038a (add test)
    events: ['fileDecoratorsChanged'],
    version: '0.0.1'
}

export class FileDecorator extends Plugin {
    private _fileStates: fileDecoration[] = []
    constructor() {
        super(profile)
    }
<<<<<<< HEAD

    onActivation(): void {
        this.on('filePanel', 'setWorkspace', async () => {
            await this.clearAllFileDecorators()
        })
    }

=======
>>>>>>> 43bc1038a (add test)
    /**
     * 
     * @param fileStates Array of file states
     */
    async setFileDecorators(fileStates: fileDecoration[] | fileDecoration) {
<<<<<<< HEAD
        const { from } = this.currentRequest
        const workspace = await this.call('filePanel', 'getCurrentWorkspace')
=======
        const workspace = await this.call('filePanel', 'getCurrentWorkspace')
        function sortByPath( a: fileDecoration, b: fileDecoration ) {
            if ( a.path < b.path ){
              return -1;
            }
            if ( a.path > b.path ){
              return 1;
            }
            return 0;
          }

>>>>>>> 43bc1038a (add test)
        const fileStatesPayload = Array.isArray(fileStates) ? fileStates : [fileStates]
        // clear all file states in the previous state of this owner on the files called
        fileStatesPayload.forEach((state) => {
            state.workspace = workspace
<<<<<<< HEAD
            state.owner = from
        })
        const filteredState = this._fileStates.filter((state) => {
            const index = fileStatesPayload.findIndex((payloadFileState: fileDecoration) => {
                return from == state.owner && payloadFileState.path == state.path
=======
        })
        const filteredState = this._fileStates.filter((state) => {
            const index = fileStatesPayload.findIndex((payloadFileState: fileDecoration) => {
                return payloadFileState.owner == state.owner && payloadFileState.path == state.path
>>>>>>> 43bc1038a (add test)
            })
            return index == -1
        })
        const newState = [...filteredState, ...fileStatesPayload].sort(sortByPath)
<<<<<<< HEAD

=======
        
>>>>>>> 43bc1038a (add test)
        if (!deepequal(newState, this._fileStates)) {
            this._fileStates = newState
            this.emit('fileDecoratorsChanged', this._fileStates)
        }
    }

<<<<<<< HEAD
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
=======
    async clearFileDecorators() {
        this._fileStates = []
        this.emit('fileDecoratorsChanged', [])
    }
>>>>>>> 43bc1038a (add test)
}