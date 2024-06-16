import cors from 'cors'
import bodyParser from 'body-parser'
import { Provider, ProviderOptions } from './provider'
import { log, error } from './utils/logs'

export type CliOptions = {
  rpc?: boolean,
  port: number
  ip: string
}

export class Server {
  provider

  constructor (options?: ProviderOptions) {
    this.provider = new Provider(options)
    this.provider.init().then(() => {
      log('Provider initiated')
      log('Test accounts:')
      log(Object.keys(this.provider.Accounts.accounts))
    }).catch((error) => {
      log(error)
    })
  }

  async start (cliOptions: CliOptions) {
    const expressWs = (await import('express-ws')).default
    const express = (await import('express')).default
    const app = express()
    const wsApp = expressWs(app)

    app.use(cors())
    app.use(bodyParser.urlencoded({ extended: true }))
    app.use(bodyParser.json())

    app.get('/', (req, res) => {
      res.send('Welcome to remix-simulator')
    })

    if (cliOptions.rpc) {
      app.use((req, res) => {
        if (req && req.body && (req.body.method === 'eth_sendTransaction' || req.body.method === 'eth_call')) {
          log('Receiving call/transaction:')
          log(req.body.params)
        }
        this.provider.sendAsync(req.body, (err, jsonResponse) => {
          if (err) {
            error(err)
            return res.send(JSON.stringify({ error: err }))
          }
          if (req && req.body && (req.body.method === 'eth_sendTransaction' || req.body.method === 'eth_call')) {
            log(jsonResponse)
          }
          res.send(jsonResponse)
        })
      })
    } else {
      wsApp.app.ws('/', (ws, req) => {
        ws.on('message', (msg) => {
          const body = JSON.parse(msg.toString())
          if (body && (body.method === 'eth_sendTransaction' || body.method === 'eth_call')) {
            log('Receiving call/transaction:')
            log(body.params)
          }
          this.provider.sendAsync(body, (err, jsonResponse) => {
            if (err) {
              error(err)
              return ws.send(JSON.stringify({ error: err }))
            }
            if (body && (body.method === 'eth_sendTransaction' || body.method === 'eth_call')) {
              log(jsonResponse)
            }
            ws.send(JSON.stringify(jsonResponse))
          })
        })

        this.provider.on('data', (result) => {
          ws.send(JSON.stringify(result))
        })
      })
    }

    app.listen(cliOptions.port, cliOptions.ip, () => {
      if (!cliOptions.rpc) {
        log('Remix Simulator listening on ws://' + cliOptions.ip + ':' + cliOptions.port)
        log('http json-rpc is deprecated and disabled by default. To enable it use --rpc')
      } else {
        log('Remix Simulator listening on http://' + cliOptions.ip + ':' + cliOptions.port)
      }
    })
  }
}

