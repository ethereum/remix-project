import { Action, SearchingInitialState, SearchState, undoBufferRecord } from "../types"

export const SearchReducer = (state: SearchState = SearchingInitialState, action: Action) => {
    switch (action.type) {
        case 'START_SEARCH':
            return {
                ...state,
                timeStamp: Date.now()
            }
        case 'SET_FIND':
            return {
                ...state,
                searchResults: null,
                find: action.payload
            }

        case 'SET_REPLACE':
            return {
                ...state,
                replace: action.payload,
            }

        case 'SET_REPLACE_ENABLED':
            return {
                ...state,
                replaceEnabled: action.payload,
            }
            
        case 'SET_INCLUDE':
            return {
                ...state,
                include: action.payload,
            }

        case 'SET_EXCLUDE':
            return {
                ...state,
                exclude: action.payload,
            }

        case 'SET_SEARCH_RESULTS':
            return {
                ...state,
                searchResults: action.payload,
                count: 0,
                run: true
            }
        case 'SET_UNDO_ENABLED':
            if(state.undoBuffer[`${action.payload.workspace}/${action.payload.path}`]){
                state.undoBuffer[`${action.payload.workspace}/${action.payload.path}`].enabled = (action.payload.content === state.undoBuffer[`${action.payload.workspace}/${action.payload.path}`].newContent)
                state.undoBuffer[`${action.payload.workspace}/${action.payload.path}`].visible = (action.payload.content !== state.undoBuffer[`${action.payload.workspace}/${action.payload.path}`].oldContent)
            }
            return {
                ...state,
            }
        case 'SET_UNDO': {
            const undoState = {
                newContent : action.payload.newContent,
                oldContent: action.payload.oldContent,
                path: action.payload.path,
                workspace: action.payload.workspace,
                timeStamp: Date.now(),
                enabled: true,
                visible: true
            }
            state.undoBuffer[`${undoState.workspace}/${undoState.path}`] = undoState
            return {
                ...state,
            }    
        }
        case 'CLEAR_STATS':
            return {
                ...state,
                count: 0,
                fileCount: 0,
                searchResults: null,
                searching: null
            }

        case 'SET_SEARCHING':
            return {
                ...state,
                searching: action.payload,
            }
            
        case 'CLEAR_UNDO': {
            state.undoBuffer = []
            return {
                ...state,
            }
        }
        case 'UPDATE_COUNT':
            if (state.searchResults) {
                const findFile = state.searchResults.find(file => file.filename === action.payload.file)
                let count = 0
                let fileCount = 0
                const clipped = false
                if (findFile) {
                    findFile.count = action.payload.count
                }
                state.searchResults.forEach(file => {
                    if (file.count) {          
                        count += file.count    
                        fileCount++
                    }
                })
                return {
                    ...state,
                    count: count,
                    fileCount,
                    clipped
                }
            } else {
                return state
            }

        case 'SET_CLIPPED':
            return {
                ...state,
                clipped: action.payload
            }
        case 'SET_RUN':
            return {
                ...state,
                run: action.payload
            }
        case 'TOGGLE_CASE_SENSITIVE':
            return {
                ...state,
                casesensitive: !state.casesensitive,
                timeStamp: Date.now()
            }
        case 'TOGGLE_USE_REGEX':
            return {
                ...state,
                useRegExp: !state.useRegExp,
                timeStamp: Date.now()
            }
        case 'TOGGLE_MATCH_WHOLE_WORD':
            return {
                ...state,
                matchWord: !state.matchWord,
                timeStamp: Date.now()
            }
        case 'SET_REPLACE_WITHOUT_CONFIRMATION':
            return {
                ...state,
                replaceWithOutConfirmation: action.payload,
            }
        case 'DISABLE_FORCE_RELOAD':
            if (state.searchResults) {
                const findFile = state.searchResults.find(file => file.filename === action.payload)
                if (findFile) findFile.forceReload = false
            }
            return {
                ...state,
            }
        case 'SET_CURRENT_FILE':
            return {
                ...state,
                currentFile: action.payload,
            }
        case 'SET_CURRENT_WORKSPACE':
            return {
                ...state,
                workspace: action.payload,
            }            
        case 'RELOAD_FILE':
            if (state.searchResults) {
                const findFile = state.searchResults.find(file => file.filename === action.payload)
                if (findFile) findFile.forceReload = true
            }
            return {
                ...state,
            }
        default:
            return {
                ...state,
            }
    }
}