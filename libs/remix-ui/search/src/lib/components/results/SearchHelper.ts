import { SearchResultLineLine } from "../../reducers/Reducer"

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
    let results:RegExpExecArray[] = [];
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
