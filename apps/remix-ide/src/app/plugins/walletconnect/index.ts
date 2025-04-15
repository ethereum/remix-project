import { Plugin } from '@remixproject/engine'
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers5/react'
import { constants } from './utils/constants'
import { Chain, RequestArguments } from './types'

const profile = {
  "name": "walletconnect",
  "kind": "provider",
  "displayName": "Wallet Connect",
  "events": [],
  "version": "2.0.0",
  "methods": ["sendAsync", "init", "openModal", "isWalletConnected", "deactivate"],
  "url": "",
  "description": "Use an external wallet for transacting",
  "icon": "data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHdpZHRoPSI1MTIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxyYWRpYWxHcmFkaWVudCBpZD0iYSIgY3g9IjAlIiBjeT0iNTAlIiByPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiM1ZDlkZjYiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiMwMDZmZmYiLz48L3JhZGlhbEdyYWRpZW50PjxnIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+PHBhdGggZD0ibTI1NiAwYzE0MS4zODQ4OTYgMCAyNTYgMTE0LjYxNTEwNCAyNTYgMjU2cy0xMTQuNjE1MTA0IDI1Ni0yNTYgMjU2LTI1Ni0xMTQuNjE1MTA0LTI1Ni0yNTYgMTE0LjYxNTEwNC0yNTYgMjU2LTI1NnoiIGZpbGw9InVybCgjYSkiLz48cGF0aCBkPSJtNjQuNjkxNzU1OCAzNy43MDg4Mjk4YzUxLjUzMjgwNzItNTAuMjc4NDM5NyAxMzUuMDgzOTk0Mi01MC4yNzg0Mzk3IDE4Ni42MTY3OTkyIDBsNi4yMDIwNTcgNi4wNTEwOTA2YzIuNTc2NjQgMi41MTM5MjE4IDIuNTc2NjQgNi41ODk3OTQ4IDAgOS4xMDM3MTc3bC0yMS4yMTU5OTggMjAuNjk5NTc1OWMtMS4yODgzMjEgMS4yNTY5NjE5LTMuMzc3MSAxLjI1Njk2MTktNC42NjU0MjEgMGwtOC41MzQ3NjYtOC4zMjcwMjA1Yy0zNS45NTA1NzMtMzUuMDc1NDk2Mi05NC4yMzc5NjktMzUuMDc1NDk2Mi0xMzAuMTg4NTQ0IDBsLTkuMTQwMDI4MiA4LjkxNzU1MTljLTEuMjg4MzIxNyAxLjI1Njk2MDktMy4zNzcxMDE2IDEuMjU2OTYwOS00LjY2NTQyMDggMGwtMjEuMjE1OTk3My0yMC42OTk1NzU5Yy0yLjU3NjY0MDMtMi41MTM5MjI5LTIuNTc2NjQwMy02LjU4OTc5NTggMC05LjEwMzcxNzd6bTIzMC40OTM0ODUyIDQyLjgwODkxMTcgMTguODgyMjc5IDE4LjQyMjcyNjJjMi41NzY2MjcgMi41MTM5MTAzIDIuNTc2NjQyIDYuNTg5NzU5My4wMDAwMzIgOS4xMDM2ODYzbC04NS4xNDE0OTggODMuMDcwMzU4Yy0yLjU3NjYyMyAyLjUxMzk0MS02Ljc1NDE4MiAyLjUxMzk2OS05LjMzMDg0LjAwMDA2Ni0uMDAwMDEtLjAwMDAxLS4wMDAwMjMtLjAwMDAyMy0uMDAwMDMzLS4wMDAwMzRsLTYwLjQyODI1Ni01OC45NTc0NTFjLS42NDQxNi0uNjI4NDgxLTEuNjg4NTUtLjYyODQ4MS0yLjMzMjcxIDAtLjAwMDAwNC4wMDAwMDQtLjAwMDAwOC4wMDAwMDctLjAwMDAxMi4wMDAwMTFsLTYwLjQyNjk2ODMgNTguOTU3NDA4Yy0yLjU3NjYxNDEgMi41MTM5NDctNi43NTQxNzQ2IDIuNTEzOTktOS4zMzA4NDA4LjAwMDA5Mi0uMDAwMDE1MS0uMDAwMDE0LS4wMDAwMzA5LS4wMDAwMjktLjAwMDA0NjctLjAwMDA0NmwtODUuMTQzODY3NzQtODMuMDcxNDYzYy0yLjU3NjYzOTI4LTIuNTEzOTIxLTIuNTc2NjM5MjgtNi41ODk3OTUgMC05LjEwMzcxNjNsMTguODgyMzEyNjQtMTguNDIyNjk1NWMyLjU3NjYzOTMtMi41MTM5MjIyIDYuNzU0MTk5My0yLjUxMzkyMjIgOS4zMzA4Mzk3IDBsNjAuNDI5MTM0NyA1OC45NTgyNzU4Yy42NDQxNjA4LjYyODQ4IDEuNjg4NTQ5NS42Mjg0OCAyLjMzMjcxMDMgMCAuMDAwMDA5NS0uMDAwMDA5LjAwMDAxODItLjAwMDAxOC4wMDAwMjc3LS4wMDAwMjVsNjAuNDI2MTA2NS01OC45NTgyNTA4YzIuNTc2NTgxLTIuNTEzOTggNi43NTQxNDItMi41MTQwNzQzIDkuMzMwODQtLjAwMDIxMDMuMDAwMDM3LjAwMDAzNTQuMDAwMDcyLjAwMDA3MDkuMDAwMTA3LjAwMDEwNjNsNjAuNDI5MDU2IDU4Ljk1ODM1NDhjLjY0NDE1OS42Mjg0NzkgMS42ODg1NDkuNjI4NDc5IDIuMzMyNzA5IDBsNjAuNDI4MDc5LTU4Ljk1NzE5MjVjMi41NzY2NC0yLjUxMzkyMzEgNi43NTQxOTktMi41MTM5MjMxIDkuMzMwODM5IDB6IiBmaWxsPSIjZmZmIiBmaWxsLXJ1bGU9Im5vbnplcm8iIHRyYW5zZm9ybT0idHJhbnNsYXRlKDk4IDE2MCkiLz48L2c+PC9zdmc+",
  "documentation": "",
  "repo": "https://github.com/yann300/remix-walletconnect/issues",
  "maintainedBy": "Remix",
  "authorContact": ""
}

export class WalletConnect extends Plugin {
  web3modal: ReturnType<typeof createWeb3Modal>
  ethersConfig: ReturnType<typeof defaultConfig>
  chains: Chain[]
  currentChain: number
  currentAccount: string

  constructor () {
    super(profile)
    const ethersConfig = defaultConfig({
      metadata: constants.METADATA,
      rpcUrl: 'https://cloudflare-eth.com'
    })

    this.web3modal = createWeb3Modal({ projectId: constants.PROJECT_ID, chains: constants.chains, metadata: constants.METADATA, ethersConfig })
    this.ethersConfig = ethersConfig
    this.chains = constants.chains
  }

  onActivation() {
    this.subscribeToEvents()
  }

  init() {
    console.log('initializing walletconnect plugin...')
  }

  async openModal() {
    if (this.isWalletConnected()) return await this.web3modal.open()
    await this.web3modal.open()
    this.web3modal.subscribeState(async (state) => {
      if (!state.open) {
        this.emit('closeModal')
        try {
          const provider = await this.web3modal.getWalletProvider()
          if (provider) {
            this.emit('connectionSuccessful')
            provider.on('connect', () => {
              this.emit('connectionSuccessful')
            })
            provider.on('disconnect', (error: { message?: string }) => {
              this.emit('connectionFailed', error?.message || 'Connection failed')
            })
            provider.on('error', (error: { message?: string }) => {
              this.emit('connectionFailed', error?.message || 'Connection error')
            })
          }
        } catch (error) {
          this.emit('connectionFailed', error.message)
        }
      }
    })
  }

  isWalletConnected() {
    return this.web3modal.getIsConnected()
  }

  subscribeToEvents() {
    this.web3modal.subscribeProvider(({ address, isConnected, chainId })=>{
      if (isConnected){
        if (address !== this.currentAccount) {
          this.currentAccount = address
          this.emit('accountsChanged', [address])
        }
        if (this.currentChain !== chainId) {
          this.currentChain = chainId
          this.emit('chainChanged', chainId)
        }
      } else {
        this.emit('accountsChanged', [])
        this.currentAccount = ''
        this.emit('chainChanged', 0)
        this.currentChain = 0
      }
    },)
    this.on('theme', 'themeChanged', (theme: any) => {
      this.web3modal.setThemeMode(theme.quality)
    })
  }

  async sendAsync(data: RequestArguments) {
    const address = this.web3modal.getAddress()
    const provider = this.web3modal.getWalletProvider()
    if (address && provider) {
      if (data.method === 'eth_accounts') {
        return {
          jsonrpc: '2.0',
          result: [address],
          id: data.id
        }
      } else {
        //@ts-expect-error this flag does not correspond to EIP-1193 but was introduced by MetaMask
        if (provider.isMetamask && provider.sendAsync) {
          return new Promise((resolve) => {
            //@ts-expect-error sendAsync is a legacy function we know MetaMask supports it
            provider.sendAsync(data, (error, response) => {
              if (error) {
                if (error.data && error.data.originalError && error.data.originalError.data) {
                  resolve({
                    jsonrpc: '2.0',
                    error: error.data.originalError,
                    id: data.id
                  })
                } else if (error.data && error.data.message) {
                  resolve({
                    jsonrpc: '2.0',
                    error: error.data && error.data,
                    id: data.id
                  })
                } else {
                  resolve({
                    jsonrpc: '2.0',
                    error,
                    id: data.id
                  })
                }
              }
              return resolve(response)
            })
          })
        } else {
          try {
            const message = await provider.request(data)
            return { jsonrpc: '2.0', result: message, id: data.id }
          } catch (e) {
            return { jsonrpc: '2.0', error: { message: e.message, code: -32603 }, id: data.id }
          }
        }
      }
    } else {
      const err = `Cannot make ${data.method} request. Remix client is not connected to walletconnect client`
      console.error(err)
      return { jsonrpc: '2.0', error: { message: err, code: -32603 }, id: data.id }
    }
  }

  async deactivate() {
    console.log('deactivating walletconnect plugin...')
  }
}
