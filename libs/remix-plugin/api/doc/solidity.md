# Solidity Compiler

- Name in Remix: `solidity`
- kind: `compiler`


|Type     |Name                   |Description |
|---------|-----------------------|------------|
|_event_  |`compilationFinished`  |Triggered when a compilation finishes.
|_method_ |`getCompilationResult` |Get the current result of the compilation.
|_method_ |`compile`              |Run solidity compiler with a file.
|_method_ |`compileWithParameters`|Run solidity compiler with a map of source files and settings
|_method_ |`setCompilerConfig`|Set settings for the compiler, see types for more info


> Method Definitions can be found [here](../src/lib/compiler/api.ts)

> Type Definitions can be found [here](../src/lib/compiler/type)