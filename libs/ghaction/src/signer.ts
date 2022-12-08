import { ethers } from "ethers"

export class SignerWithAddress extends ethers.Signer {
    static async create(signer) {
        return new SignerWithAddress(await signer.getAddress(), signer)
    }

    constructor(address, _signer) {
        super()
        this.address = address
        this._signer = _signer
        this.provider = _signer.provider
    }

    async getAddress() {
        return this.address
    }

    signMessage(message){
        return this._signer.signMessage(message)
    }

    signTransaction(transaction) {
        return this._signer.signTransaction(transaction)
    }

    sendTransaction(transaction) {
        return this._signer.sendTransaction(transaction)
    }

    connect(provider) {
        return new SignerWithAddress(this.address, this._signer.connect(provider))
    }

    _signTypedData(...params) {
        return this._signer._signTypedData(...params)
    }

    toJSON() {
        return `<SignerWithAddress ${this.address}>`
    }
}
