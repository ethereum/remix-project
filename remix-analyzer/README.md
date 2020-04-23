## Remix Analyzer
[![npm version](https://badge.fury.io/js/remix-analyzer.svg)](https://www.npmjs.com/package/remix-analyzer)
[![npm](https://img.shields.io/npm/dt/remix-analyzer.svg?label=Total%20Downloads)](https://www.npmjs.com/package/remix-analyzer)
[![npm](https://img.shields.io/npm/dw/remix-analyzer.svg)](https://www.npmjs.com/package/remix-analyzer)
[![GitHub](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/ethereum/remix/tree/master/remix-analyzer)
[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/ethereum/remix/issues)

`remix-analyzer` is a tool to perform static analysis on Solidity smart contracts to check security vulnerabilities and bad development practices. It works underneath Remix IDE plugin "SOLIDITY STATIC ANALYSIS" which is used to run analysis for a compiled contract according to selected modules.

### Installation
`remix-analyzer` is an NPM package and can be installed using NPM as:

`npm install remix-analyzer`

### How to use

`remix-analyzer` exports below interface:

```
import { CompilationResult, AnalyzerModule, AnalysisReport } from 'types';
declare type ModuleObj = {
    name: string;
    mod: AnalyzerModule;
};
export default class staticAnalysisRunner {
    /**
     * Run analysis (Used by IDE)
     * @param compilationResult contract compilation result
     * @param toRun module indexes (compiled from remix IDE)
     * @param callback callback
     */
    run(compilationResult: CompilationResult, toRun: number[], callback: ((reports: AnalysisReport[]) => void)): void;
    
    /**
     * Run analysis passing list of modules to run
     * @param compilationResult contract compilation result
     * @param modules analysis module
     * @param callback callback
     */
    runWithModuleList(compilationResult: CompilationResult, modules: ModuleObj[], callback: ((reports: AnalysisReport[]) => void)): void;
    
    /**
     * Get list of all analysis modules
     */
    modules(): any[];
}
```
One can import the module and use the available methods to run analysis. Related type descriptions can be seen [here](https://github.com/ethereum/remix/blob/master/remix-analyzer/src/types.ts).

Details of modules are explained in [official remix-ide documentation](https://remix-ide.readthedocs.io/en/latest/static_analysis.html).

### Contribute

We are always open to new features or bug reports. Please feel free to open an issue or a pull request. 

In case you want to add some code, do have a look to our contribution guidelnes [here](https://github.com/ethereum/remix/blob/master/CONTRIBUTING.md). Reach us in [Gitter](https://gitter.im/ethereum/remix) in case of any queries.

### License

MIT © 2018-20 Remix Team

