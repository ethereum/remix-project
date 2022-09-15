import { handleComments, printComment } from 'prettier-plugin-solidity/src/comments';
import massageAstNode from 'prettier-plugin-solidity/src/clean.js';
import options from 'prettier-plugin-solidity/src/options.js';
import print from 'prettier-plugin-solidity/src/printer.js';
import loc from 'prettier-plugin-solidity/src/loc.js';
import { parse } from './parser'

// https://prettier.io/docs/en/plugins.html#languages
// https://github.com/ikatyang/linguist-languages/blob/master/data/Solidity.json
const languages = [
    {
        linguistLanguageId: 237469032,
        name: 'Solidity',
        type: 'programming',
        color: '#AA6746',
        aceMode: 'text',
        tmScope: 'source.solidity',
        extensions: ['.sol'],
        parsers: ['solidity-parse'],
        vscodeLanguageIds: ['solidity']
    }
];

// https://prettier.io/docs/en/plugins.html#parsers
const parser = { astFormat: 'solidity-ast', parse, ...loc };
const parsers = {
    'solidity-parse': parser
};

const canAttachComment = (node) =>
    node.type && node.type !== 'BlockComment' && node.type !== 'LineComment';

// https://prettier.io/docs/en/plugins.html#printers
const printers = {
    'solidity-ast': {
        canAttachComment,
        handleComments: {
            ownLine: handleComments.handleOwnLineComment,
            endOfLine: handleComments.handleEndOfLineComment,
            remaining: handleComments.handleRemainingComment
        },
        isBlockComment: handleComments.isBlockComment,
        massageAstNode,
        print,
        printComment
    }
};

// https://prettier.io/docs/en/plugins.html#defaultoptions
const defaultOptions = {
    bracketSpacing: false,
    tabWidth: 4
};

export default {
    languages,
    parsers,
    printers,
    options,
    defaultOptions
};
