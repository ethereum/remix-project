'use strict'
import { Plugin } from '@remixproject/engine'
import prettier from 'prettier/standalone'
import { Options } from 'prettier';
import * as sol from 'prettier-plugin-solidity'
import { parse } from './code-format/parser'
import * as ts from 'prettier/parser-typescript'
import * as babel from 'prettier/parser-babel'
import * as espree from 'prettier/parser-espree'
import path from 'path'

const profile = {
    name: 'codeFormatter',
    desciption: 'prettier plugin for Remix',
    methods: ['format'],
    events: [''],
    version: '0.0.1'
}

export class CodeFormat extends Plugin {

    constructor() {
        super(profile)
        // need to change the parser in the npm package because it conflicts with the parser already in the app
        const loc = {
            locEnd: (node) => getRange(1, node),
            locStart: (node) => getRange(0, node)
        }
        const parser = { astFormat: 'solidity-ast', parse, ...loc };
        sol.parsers = {
            'solidity-parse': parser
        }
    }

    async format() {
        const file = await this.call('fileManager', 'getCurrentFile')
        const content = await this.call('fileManager', 'readFile', file)
        let parserName = ''
        let options: Options = {
        }
        switch (path.extname(file)) {
            case '.sol':
                parserName = 'solidity-parse'
                break
            case '.ts':
                parserName = 'typescript'
                options = {
                    ...options,
                    trailingComma: 'all',
                    semi: false,
                    singleQuote: true,
                    quoteProps: 'as-needed',
                    bracketSpacing: true,
                    arrowParens: 'always',
                }
                break
            case '.js':
                parserName = "espree"
                options = {
                    ...options,
                    semi: false,
                    singleQuote: true,
                }
                break
            case '.json':
                parserName = 'json'
                break
        }
        const result = prettier.format(content, {
            plugins: [sol, ts, babel, espree],
            parser: parserName,
            ...options
        })
        await this.call('fileManager', 'writeFile', file, result)
    }

}

function getRange(index, node) {
    if (node.range) {
        return node.range[index];
    }
    if (node.expression && node.expression.range) {
        return node.expression.range[index];
    }
    return null;
}
