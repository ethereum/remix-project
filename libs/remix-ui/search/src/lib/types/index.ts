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

export interface undoBufferRecord {
    workspace: string,
    path: string,
    newContent: string,
    timeStamp: number,
    oldContent: string,
    enabled: boolean,
    visible: boolean
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
    fileCount: number,
    maxFiles: number,
    maxLines: number
    clipped: boolean,
    undoBuffer: Record<string, undoBufferRecord>[],
    currentFile: string,
    workspace: string,
    searching: string | null,
    run: boolean,
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
  fileCount: 0,
  maxFiles: 5000,
  maxLines: 5000,
  clipped: false,
  undoBuffer: null,
  currentFile: '',
  workspace: '',
  searching: null,
  run: false,
}

export interface SearchInWorkspaceOptions {
	pattern: string
	path: string
  /**
   * Maximum number of results to return.  Defaults to unlimited.
   */
  maxResults?: number
  /**
   * Search case sensitively if true.
   */
  matchCase?: boolean
  /**
   * Search whole words only if true.
   */
  matchWholeWord?: boolean
  /**
   * Use regular expressions for search if true.
   */
  useRegExp?: boolean
  /**
   * Include all .gitignored and hidden files.
   */
  includeIgnored?: boolean
  /**
   * Glob pattern for matching files and directories to include the search.
   */
  include?: string[]
  /**
   * Glob pattern for matching files and directories to exclude the search.
   */
  exclude?: string[]
}