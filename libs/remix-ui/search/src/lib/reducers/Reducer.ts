
interface Action {
    type: string
    payload: any
}

interface position {
    start: {
      line: number
      column: number
    },
    end: {
      line: number
      column: number
    }
  }

export interface SearchResultLineLine {
    left: any,
    center: any,
    right: any,
    position: position
}
export interface SearchResultLine {
    lines: SearchResultLineLine[]
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
    switch (action.type) {
        case 'SET_FIND':
            return {
                ...state,
                find: action.payload,
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
            }

        default:
    }
}