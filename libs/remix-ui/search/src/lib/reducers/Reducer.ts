import { Action, SearchingInitialState, SearchState } from "../types"

export const SearchReducer = (state: SearchState = SearchingInitialState, action: Action) => {
    switch (action.type) {
        case 'SET_FIND':
            return {
                ...state,
                find: action.payload,
                timeStamp: Date.now()
            }

        case 'SET_REPLACE':
            return {
                ...state,
                replace: action.payload,
            }

        case 'SET_INCLUDE':
            return {
                ...state,
                include: action.payload,
                timeStamp: Date.now()
            }

        case 'SET_EXCLUDE':
            return {
                ...state,
                exclude: action.payload,
                timeStamp: Date.now()
            }

        case 'SET_SEARCH_RESULTS':
            return {
                ...state,
                searchResults: action.payload,
                count: 0
            }
        case 'UPDATE_COUNT':
            if (state.searchResults) {
                const findFile = state.searchResults.find(file => file.filename === action.payload.file)
                let count = 0
                if (findFile) {
                    findFile.count = action.payload.count
                }
                state.searchResults.forEach(file => {
                    if (file.count) {
                        count += file.count
                    }
                })
                return {
                    ...state,
                    count: count
                }
            } else {
                return state
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