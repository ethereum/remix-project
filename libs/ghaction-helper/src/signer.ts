// @ts-ignore
import { ethers } from "ethers"

export class SignerWithAddress extends ethers.Signer {
    address: string
    _signer: {
        provider: any
        signTransaction: (transaction: any) => any,
        signMessage: (message: string) => any,
        sendTransaction: (transaction: any) => any,
        connect: (provider: any) => any,
        _signTypedData: (...params: any) => any
    }
    provider: any
    static async create(signer: any) {
        return new SignerWithAddress(await signer.getAddress(), signer)
    }

    constructor(address: string, _signer: any) {
        super()
        this.address = address
        this._signer = _signer
        this.provider = _signer.provider
    }

    async getAddress() {
        return this.address
    }

    signMessage(message: string){
        return this._signer.signMessage(message)
    }

    signTransaction(transaction: any) {
        return this._signer.signTransaction(transaction)
    }

    sendTransaction(transaction: any) {
        return this._signer.sendTransaction(transaction)
    }

    connect(provider: any) {
        return new SignerWithAddress(this.address, this._signer.connect(provider))
    }

    _signTypedData(...params: any) {
        return this._signer._signTypedData(...params)
    }

    toJSON() {
        return `<SignerWithAddress ${this.address}>`
    }
}