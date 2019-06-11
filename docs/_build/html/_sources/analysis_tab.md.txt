Analysis
========

This section gives information about the last compilation. By default, a
new analysis is run at each compilation.

The analysis tab gives detailed information about the contract code. It
can help you avoid code mistakes and to enforce best practices.

![](images/a-analysis.png)

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
