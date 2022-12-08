import { CompilationResult } from '@remix-project/remix-solidity'
import * as fs from 'fs/promises'
import * as path from 'path'

declare global {
    const remixContractArtefactsPath: string
}

export async function getArtefactsByContractName (contractIdentifier: string) {
    const contractArtefacts = await fs.readdir(global.remixContractArtefactsPath)
    let contract

    for (const artefactFile of contractArtefacts) {
      const artefact = await fs.readFile(path.join(global.remixContractArtefactsPath, artefactFile), 'utf-8')
      const artefactJSON: CompilationResult = JSON.parse(artefact)
      const contractFullPath = (Object.keys(artefactJSON.contracts!)).find((contractName) => artefactJSON.contracts![contractName] && artefactJSON.contracts![contractName][contractIdentifier])
      
      contract = contractFullPath ? artefactJSON.contracts![contractFullPath!][contractIdentifier] : undefined
      if (contract) break
    }
    return contract
}