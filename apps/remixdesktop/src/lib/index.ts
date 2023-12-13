export const ansiRegex = ({onlyFirst = false} = {}) => {
	const pattern = [
		'[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)',
		'(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]))'
	].join('|');

	return new RegExp(pattern, onlyFirst ? undefined : 'g');
}

export const stripAnsi = (string: string) => {
  const regex = ansiRegex();
	if (typeof string !== 'string') {
		throw new TypeError(`Expected a \`string\`, got \`${typeof string}\``);
	}
	return string.replace(regex, '');
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