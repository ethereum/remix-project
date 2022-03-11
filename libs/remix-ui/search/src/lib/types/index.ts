import { count } from "console";

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
    timeStamp: number,
    forceReload: boolean,
    count: number
}

export interface SearchState {
    find: string,
    searchResults: SearchResult[],
    replace: string,
    replaceEnabled: boolean,
    include: string,
    exclude: string,
    casesensitive: boolean,
    matchWord: boolean,
    replaceWithOutConfirmation: boolean,
    useRegExp: boolean,
    timeStamp: number,
    count: number,
    maxResults: number
    maxFiles: number,
    maxLines: number
}

export const SearchingInitialState: SearchState = {
    find: '',
    replace: '',
    include: '',
    exclude: '',
    replaceEnabled: false,
    searchResults: [],
    casesensitive: false,
    matchWord: false,
    useRegExp: false,
    replaceWithOutConfirmation: false,
    timeStamp: 0,
    count: 0,
    maxResults: 1500,
    maxFiles: 100,
    maxLines: 200
}