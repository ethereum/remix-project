'use strict'
import { Plugin } from '@remixproject/engine'
import prettier from 'prettier/standalone'
import { Options } from 'prettier';
import sol from './code-format/index'
import * as ts from 'prettier/parser-typescript'
import * as babel from 'prettier/parser-babel'
import * as espree from 'prettier/parser-espree'
import path from 'path'
import yaml from 'js-yaml'
import toml from 'toml'

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

    async format(file: string) {

        try {
            const content = await this.call('fileManager', 'readFile', file)
            if (!content) return
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
            const possibleFileNames = [
                '.prettierrc',
                '.prettierrc.json',
                '.prettierrc.yaml',
                '.prettierrc.yml',
                '.prettierrc.toml',
                '.prettierrc.js',
                '.prettierrc.cjs',
                'prettier.config.js',
                'prettier.config.cjs',
                '.prettierrc.json5',
            ]

            const prettierConfigFile = await findAsync(possibleFileNames, async (fileName) => {
                const exists = await this.call('fileManager', 'exists', fileName)
                return exists
            })

            let parsed = null
            if (prettierConfigFile) {
                let prettierConfig = await this.call('fileManager', 'readFile', prettierConfigFile)
                if (prettierConfig) {
                    if (prettierConfigFile.endsWith('.yaml') || prettierConfigFile.endsWith('.yml')) {
                        parsed = yaml.load(prettierConfig)
                    } else if (prettierConfigFile.endsWith('.toml')) {
                        parsed = toml.parse(prettierConfig)
                    } else if (prettierConfigFile.endsWith('.json') || prettierConfigFile.endsWith('.json5')) {
                        parsed = JSON.parse(prettierConfig)
                    } else if (prettierConfigFile === '.prettierrc') {
                        try {
                            parsed = JSON.parse(prettierConfig)
                        } catch (e) {
                            // do nothing
                        }
                        if (!parsed) {
                            try {
                                parsed = yaml.load(prettierConfig)
                            } catch (e) {
                                // do nothing
                            }
                        }
                    } else if (prettierConfigFile.endsWith('.js') || prettierConfigFile.endsWith('.cjs')) {
                        // remove any comments
                        prettierConfig = prettierConfig.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '')
                        // add quotes to keys
                        prettierConfig = prettierConfig.replace(/([a-zA-Z0-9_]+)(\s*):/g, '"$1"$2:')
                        // remove comma from last key
                        prettierConfig = prettierConfig.replace(/,(\s*})/g, '$1')
                        // remove any semi-colons
                        prettierConfig = prettierConfig.replace(/;/g, '')
                        // convert single quotes to double quotes
                        prettierConfig = prettierConfig.replace(/'/g, '"')
                        try {
                            parsed = JSON.parse(prettierConfig.replace('module.exports = ', '').replace('module.exports=', ''))
                        } catch (e) {
                            // do nothing
                        }
                    }
                }
            }
            if(!parsed && prettierConfigFile) {
                this.call('notification', 'toast', `Error parsing prettier config file: ${prettierConfigFile}`)
            }
            // merge options
            if (parsed) {
                options = {
                    ...options,
                    ...parsed,
                }
            }
            const result = prettier.format(content, {
                plugins: [sol as any, ts, babel, espree],
                parser: parserName,
                ...options
            })
            await this.call('fileManager', 'writeFile', file, result)
        } catch (e) {
            // do nothing
        }
    }

}

async function findAsync(arr, asyncCallback) {
    const promises = arr.map(asyncCallback);
    const results = await Promise.all(promises);
    const index = results.findIndex(result => result);
    return arr[index];
}
