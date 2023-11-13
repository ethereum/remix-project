export interface ISemaphoreDeploymentData {
    semaphoreAddress: string,
    verifierAddress: string
}

export interface IGroup {
    group_id: number
    members: IGroupMember[]
}

export interface IGroupMember {
    commmitment: number
}

export type NumericString = `${number}`

export type SemaphoreProof = {
    merkleTreeRoot: NumericString
    signal: NumericString
    nullifierHash: NumericString
    externalNullifier: NumericString
    proof: PackedProof
}

export type PackedProof = [
    NumericString,
    NumericString,
    NumericString,
    NumericString,
    NumericString,
    NumericString,
    NumericString,
    NumericString
]

export type IIdentity = {
    trapdoor: any,
    nullifier: any,
    secret: any,
    commitment: any,
    data: any,
    group_id: any
}