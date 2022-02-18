
interface Action {
    type: string
    payload: any
}

export interface SearchResultLine {
    lineNumber: number
    text: string
}

export interface SearchResult {
    filename: string,
    path: string,
    lines: SearchResultLine[],
    searchComplete: boolean
}    

export interface SearchState  {
    find: string,
    searchResults: SearchResult[],
    replace: string,
    include: string,
    exclude: string,
}

export const SearchingInitialState: SearchState = {
    find: '',
    replace: '',
    include: '',
    exclude: '',
    searchResults: []
}

export const SearchReducer = (state: SearchState = SearchingInitialState, action: Action) => {
    console.log(state)
    switch (action.type) {
        case 'SET_FIND':
            return {
                ...state,
                find: action.payload,
            }
            break;
        case 'SET_REPLACE':
            return {
                ...state,
                replace: action.payload,
            }
            break;
        case 'SET_INCLUDE':
            return {
                ...state,
                include: action.payload,
            }
            break;
        case 'SET_EXCLUDE':
            return {
                ...state,
                exclude: action.payload,
            }
            break;
        case 'SET_SEARCH_RESULTS':
            return {
                ...state,
                searchResults: action.payload,
            }
            break;
        default:
    }
}