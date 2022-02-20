
export interface Action {
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
    timeStamp: number
}

export interface SearchState {
    find: string,
    searchResults: SearchResult[],
    replace: string,
    include: string,
    exclude: string,
    casesensitive: boolean,
    matchWord: boolean,
    timeStamp: number
}

export const SearchingInitialState: SearchState = {
    find: '',
    replace: '',
    include: '',
    exclude: '',
    searchResults: [],
    casesensitive: false,
    matchWord: false,
    timeStamp: 0
}