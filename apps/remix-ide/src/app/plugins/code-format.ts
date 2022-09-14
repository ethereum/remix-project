'use strict'
import { Plugin } from '@remixproject/engine'
import prettier from 'prettier/standalone'
import { Options } from 'prettier';
import sol from './code-format/index'
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
            plugins: [sol as any, ts, babel, espree],
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
