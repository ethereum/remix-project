import { EOL } from 'os'
import { SearchResultLineLine } from '../../types'


export const getDirectory = async (dir: string, plugin: any) => {
    let result = []
    const files = await plugin.call('fileManager', 'readdir', dir)
    const fileArray = normalize(files)
    for (const fi of fileArray) {
      if (fi) {
        const type = fi.data.isDirectory
        if (type === true) {
          result = [...result, ...(await getDirectory(`${fi.filename}`, plugin))]
        } else {
          result = [...result, fi.filename]
        }
      }
    }
    return result
  }

  const normalize = filesList => {
    const folders = []
    const files = []
    Object.keys(filesList || {}).forEach(key => {
      if (filesList[key].isDirectory) {
        folders.push({
          filename: key,
          data: filesList[key]
        })
      } else {
        files.push({
          filename: key,
          data: filesList[key]
        })
      }
    })
    return [...folders, ...files]
  }

export const findLinesInStringWithMatch = (str: string, re: RegExp) => {
    return str
        .split(/\r?\n/)
        .map(function (line, i) {
            const matchResult = matchesInString(line, re)
            if (matchResult.length) {
                return {
                    lines: splitLines(matchResult, i),
                }
            }
        })
        .filter(Boolean)
}

const matchesInString = (str: string, re: RegExp) => {
    let a: RegExpExecArray
    const results:RegExpExecArray[] = [];
    while ((a = re.exec(str || '')) !== null) {
        results.push(a);
    }
    return results
}

const splitLines = (matchResult: RegExpExecArray[], lineNumber: number) => {
    return matchResult.map((matchResultPart, i) => {
        const result:SearchResultLineLine = {
            left: matchResultPart.input.substring(0, matchResultPart.index),
            right: matchResultPart.input.substring(matchResultPart.index + matchResultPart[0].length),
            center: matchResultPart[0],
            position : {
                start: {
                    line: lineNumber,
                    column: matchResultPart.index,
                },
                end: {
                    line: lineNumber,
                    column: matchResultPart.index + matchResultPart[0].length,
                },
            },
        }
        return result
    })
}

function getEOL(text) {
    const m = text.match(/\r\n|\n/g);
    const u = m && m.filter(a => a === '\n').length;
    const w = m && m.length - u;
    if (u === w) {
        return EOL; // use the OS default
    }
    return u > w ? '\n' : '\r\n';
}

export const replaceAllInFile = (string: string, re:RegExp, newText: string) => {
  return string.replace(re, newText)
}

export const replaceTextInLine = (str: string, searchResultLine: SearchResultLineLine, newText: string) => {
    return str
    .split(/\r?\n/)
    .map(function (line, i) {
        if (i === searchResultLine.position.start.line) {
            return searchResultLine.left + newText + searchResultLine.right
        }
        return line
    }).join(getEOL(str))
}



