import { CompiledContract, ABIParameter } from '@remixproject/plugin'

import sampleData from './sample-data/sample-artifact.json'
import sampleDataWithComments from './sample-data/sample-artifact-with-comments.json'

export const buildFakeArtifact: () => CompiledContract = () => {
    const result = sampleData as never as CompiledContract
    return result
}

export const buildFakeArtifactWithComments: () => CompiledContract = () => {
    const result = sampleDataWithComments as never as CompiledContract
    return result
}

export const buildFakeABIParameter: () => ABIParameter = () => {
    return {
        internalType: "address",
        name: "allocator",
        type: "address"
    }
}

export const buildFakeABIParameterWithDocumentation: () => ABIParameter = () => {
    return {
        internalType: "address",
        name: "allocator",
        type: "address"
    }
}