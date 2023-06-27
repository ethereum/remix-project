// const compile = () => {
//     const currentFile = api.currentFile

//     if (currentFile.endsWith('.circom')) return compileCircuit()
//     if (!isSolFileSelected()) return
//     _setCompilerVersionFromPragma(currentFile)
//     let externalCompType
//     if (hhCompilation) externalCompType = 'hardhat'
//     else if (truffleCompilation) externalCompType = 'truffle'
//     compileTabLogic.runCompiler(externalCompType)
//   }

//   const compileAndRun = () => {
//     const currentFile = api.currentFile

//     if (currentFile.endsWith('.circom')) return compileCircuit()
//     if (!isSolFileSelected()) return
//     _setCompilerVersionFromPragma(currentFile)
//     let externalCompType
//     if (hhCompilation) externalCompType = 'hardhat'
//     else if (truffleCompilation) externalCompType = 'truffle'
//     api.runScriptAfterCompilation(currentFile)
//     compileTabLogic.runCompiler(externalCompType)
//   }

//   const compileCircuit = () => {
//     const currentFile = api.currentFile

//     console.log('Compiling circuit ' + currentFile)
//   }