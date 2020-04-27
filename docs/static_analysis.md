Solidity Static Analysis
========================

Static code analysis is a process to debug the code by examining it and without actually executing the code. 

`Solidity Static Analysis` plugin performs static analysis on Solidity smart contracts once they are compiled. It helps to check security vulnerabilities and bad development practices. This plugin comes with `Solidity` environment of Remix IDE. It can also be activated individually from `Plugin Manager`.

How to use
------------

If you select this plugin, you will see a number of modules listed along with checkboxes, one `Auto run` checkbox and a `Run` button.

![](images/a-static-analysis.png)

By default, all modules are selected for analysis and a new analysis is performed at each compilation.

One can select the modules under which contract should be analyzed and can run the analysis again for last compiled contract by clicking on `Run`.

If you don't want to run analysis each time you compile a contract, just uncheck the checkbox near to `Auto run`.

Analysis Modules
-----------------

Here is the list of analyzers:

Security:
-   Transaction origin: Warns if tx.origin is used
-   Check effects: Avoid potential reentrancy bugs
-   Inline assembly: Use of Inline Assembly
-   Block timestamp: Semantics maybe unclear
-   Low level calls: Semantics maybe unclear
-   Block.blockhash usage: Semantics maybe unclear


Gas & Economy:
-   Gas costs: Warns if the gas requirements of the functions
    are too high
-   This on local calls: Invocation of local functions via
    this

Miscellaneous:
-   Constant functions: Checks for potentially constant
    functions
-   Similar variable names: Checks if variable names are too
    similar
