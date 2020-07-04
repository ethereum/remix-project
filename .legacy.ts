import {
    CompilationResult,
    CompiledContract,
    DeveloperDocumentation,
    UserDocumentation,
    DevMethodDoc,
    FunctionDescription,
    UserMethodDoc,
    ABIParameter
} from '@remixproject/plugin-iframe'

type TemplateDoc<T> = { [key in keyof T]: (...params: any[]) => string }

/** Create documentation for a compilation result */
export function createDoc(result: CompilationResult) {
    return Object.keys(result.contracts).reduce((acc, fileName) => {
        const contracts = result.contracts[fileName]
        Object.keys(contracts).forEach((name) => (acc[name] = getContractDoc(name, contracts[name])))
        return acc
    }, {})
}

//////////////
// CONTRACT //
//////////////

type ContractDoc = DeveloperDocumentation & UserDocumentation

/** Map of the content to display for a contract */
const contractDocTemplate: TemplateDoc<ContractDoc> = {
    author: (author: string) => `> Created By ${author}\n`,
    details: (details: string) => `${details}`,
    title: (title: string) => `## ${title}`,
    notice: (notice: string) => `_${notice}_`,
    methods: () => '' // Methods is managed by getMethod()
}

/** Create the documentation for a contract */
function getContractDoc(name: string, contract: CompiledContract) {
    const methods = { ...contract.userdoc.methods, ...contract.devdoc.methods }
    const contractDoc = { ...contract.userdoc, ...contract.devdoc, methods }

    const methodsDoc = contract.abi
        .map((def: FunctionDescription) => {
            if (def.type === 'constructor') {
                def.name = 'constructor'
                // because "constructor" is a string and not a { notice } object for userdoc we need to do that
                const methodDoc = {
                    ...(contract.devdoc.methods.constructor || {}),
                    notice: contract.userdoc.methods.constructor as string
                }
                return getMethodDoc(def, methodDoc)
            } else {
                if (def.type === 'fallback') def.name = 'fallback'
                const method = Object.keys(contractDoc.methods).find((key) => key.includes(def.name))
                const methodDoc = contractDoc.methods[method]
                return getMethodDoc(def, methodDoc)
            }
        })
        .join('\n')

    const doc = Object.keys(contractDoc)
        .filter((key) => key !== 'methods')
        .map((key) => contractDocTemplate[key](contractDoc[key]))
        .join('\n')

    return `# ${name}\n${doc}\n${methodsDoc}`
}

////////////
// METHOD //
////////////
type MethodDoc = DevMethodDoc & UserMethodDoc

/** Map of the content to display for a method */
const devMethodDocTemplate: TemplateDoc<MethodDoc> = {
    author: (author: string) => `> Created By ${author}\n`,
    details: (details: string) => details,
    return: (value: string) => `Return : ${value}`,
    notice: (notice: string) => notice,
    returns: () => '', // Implemented by getParams()
    params: () => '' // Implemented by getParams()
}

/** Create a table of param */
const getParams = (params: string[]) =>
    params.length === 0
        ? '_No parameters_'
        : `|name |type |description
  |-----|-----|-----------
  ${params.join('\n')}`

/** Get the details of a method */
const getMethodDetails = (devMethod: Partial<MethodDoc>) =>
    !devMethod
        ? '**Add Documentation for the method here**'
        : Object.keys(devMethod)
            .filter((key) => key !== 'params')
            .map((key) => devMethodDocTemplate[key](devMethod[key]))
            .join('\n')

function extractParams(params: ABIParameter[], devparams: any) {
    return params.map((input) => {
        const description = devparams[input.name] || ''
        return `|${input.name}|${input.type}|${description}`
    })
}
/** Get the doc for a method */
function getMethodDoc(def: FunctionDescription, devdoc?: Partial<MethodDoc>) {
    const doc = devdoc || {}
    const devparams = doc.params || {}
    const params = extractParams(def.inputs || [], devparams)
    const returns = extractParams(def.outputs || [], devparams)
    return `
  ## ${def.name} - ${def.constant ? 'view' : 'read'}
  ${getParams(params)}
  ${getMethodDetails(devdoc)}
  ${`Returns:\n${getParams(returns)}`}`
}