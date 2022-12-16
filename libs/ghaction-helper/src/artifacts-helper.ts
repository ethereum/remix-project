import { CompilationResult } from '@remix-project/remix-solidity'
//@ts-ignore
import * as fs from 'fs/promises'
import * as path from 'path'

export async function getArtifactsByContractName (contractIdentifier: string) {
  //@ts-ignore
  const contractArtifacts = await fs.readdir(global.remixContractArtifactsPath)
  let contract

  for (const artifactFile of contractArtifacts) {
    //@ts-ignore
    const artifact = await fs.readFile(path.join(global.remixContractArtifactsPath, artifactFile), 'utf-8')
    const artifactJSON: CompilationResult = JSON.parse(artifact)
    const contractFullPath = (Object.keys(artifactJSON.contracts!)).find((contractName) => artifactJSON.contracts![contractName] && artifactJSON.contracts![contractName][contractIdentifier])
    
    contract = contractFullPath ? artifactJSON.contracts![contractFullPath!][contractIdentifier] : undefined
    if (contract) break
  }
  return contract
}
