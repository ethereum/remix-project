'use strict'
import { Plugin } from '@remixproject/engine'
import prettier from 'prettier/standalone'
import { Options } from 'prettier';
import sol from './code-format/index'
import * as ts from 'prettier/parser-typescript'
import * as babel from 'prettier/parser-babel'
import * as espree from 'prettier/parser-espree'
import * as yml from 'prettier/parser-yaml'
import path from 'path'
import yaml from 'js-yaml'
import toml from 'toml'
import { filePathFilter, AnyFilter } from '@jsdevtools/file-path-filter'

const profile = {
    name: 'codeFormatter',
    desciption: 'prettier plugin for Remix',
    methods: ['format'],
    events: [''],
    version: '0.0.1'
}

const defaultOptions = {
    "overrides": [
        {
            "files": "*.sol",
            "options": {
                "printWidth": 80,
                "tabWidth": 4,
                "useTabs": false,
                "singleQuote": false,
                "bracketSpacing": false,
            }
        },
        {
            "files": "*.yml",
            "options": {
            }
        },
        {
            "files": "*.yaml",
            "options": {
            }
        },
        {
            "files": "*.toml",
            "options": {
            }
        },
        {
            "files": "*.json",
            "options": {
            }
        },
        {
            "files": "*.js",
            "options": {
            }
        },
        {
            "files": "*.ts",
            "options": {
            }
        }
    ]
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
	    // parse TOML file
	    // parse YAML file
	    // parse JSON file
	    
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
                case '.yml':
                    parserName = 'yaml'
                    break
                case '.yaml':
                    parserName = 'yaml'
                    break
            }
	    const possibleFileNames = [
		'.prettierrc',
		'.prettierrc.json',
		'.prettierrc.yaml',
		'.prettierrc.yml',
		'.prettierrc.toml',
		'prettier.js',
		'prettier.cjs',
		'prettier.config.js',
		'prettier.config.cjs',
		'prettier.config.mjs',
		'prettier.config.ts',
	    ]
	    // find first file that exists
	    const prettierConfigFile = possibleFileNames.find(async fileName => await this.call('fileManager', 'exists', fileName))

	    console.log(prettierConfigFile)

            const result = prettier.format(content, {
                plugins: [sol as any, ts, babel, espree, yml],
                parser: parserName,
                ...options
            })
            await this.call('fileManager', 'writeFile', file, result)
        } catch (e) {
            // do nothing
        }
    }

}

//*.sol, **/*.txt, contracts/*
const setGlobalExpression = (paths: string) => {
    const results = []
    paths.split(',').forEach(path => {
        path = path.trim()
        if (path.startsWith('*.')) path = path.replace(/(\*\.)/g, '**/*.')
        if (path.endsWith('/*') && !path.endsWith('/**/*'))
            path = path.replace(/(\*)/g, '**/*.*')
        results.push(path)
    })
    return results
}

async function findAsync(arr, asyncCallback) {
    const promises = arr.map(asyncCallback);
    const results = await Promise.all(promises);
    const index = results.findIndex(result => result);
    return arr[index];
}
