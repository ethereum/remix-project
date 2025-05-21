import { CompilationResult } from '../types/types'

const compilationParams = {
  optimize: false,
  evmVersion: null,
  language: 'Solidity',
  version: '0.8.29+commit.ab55807c'
}

export const compilecontracts = async (contracts, plugin): Promise<CompilationResult> => {
  // do not compile tests files
  try {
    // console.log('Compiling contracts:', contracts)
    const result = await plugin.call('solidity' as any, 'compileWithParameters', contracts, compilationParams)
    console.log('Compilation result:', result)
    const data = result.data
    let error = false

    if (data.errors) {
      // console.log('Compilation errors:', data.errors)
      error = data.errors.find((error) => error.type !== 'Warning')
    }

    const errorFiles:{ [key: string]: any } = {};
    const fillErrors = (err) => {
      if (errorFiles[err.sourceLocation.file]) {
        errorFiles[err.sourceLocation.file].errors.push({
          errorStart : err.sourceLocation.start,
          errorEnd : err.sourceLocation.end,
          errorMessage : err.formattedMessage
        })
      } else {
        errorFiles[err.sourceLocation.file] = {
          content : contracts[err.sourceLocation.file].content,
          errors : [{
            errorStart : err.sourceLocation.start,
            errorEnd : err.sourceLocation.end,
            errorMessage : err.formattedMessage
          }]
        }
      }
    }
    if (data.errors && data.errors.length && error) {
      for (const error of data.errors) {
        if (error.type === 'Warning') continue
        fillErrors(error);
      }

      const msg = `
          - Compilation errors: ${data.errors.map((e) => e.formattedMessage)}.
          `
      return { compilationSucceeded: false, errors: msg, errfiles: errorFiles }
    }

    if (data.error) {
      errorFiles['contracts'] = contracts
      errorFiles['error'] = data.error
      const msg = `
					- Compilation errors: ${data.error}.
					`
      return { compilationSucceeded: false, errors: msg, errfiles: errorFiles }
    }

    return { compilationSucceeded: true, errors: null }
  } catch (err) {
    return { compilationSucceeded: false, errors: 'An unexpected error occurred during compilation.' }
  }
}
