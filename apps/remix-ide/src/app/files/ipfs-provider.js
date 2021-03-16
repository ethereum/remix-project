'use strict'

import { Plugin } from '@remixproject/engine'
import IpfsHttpClient from 'ipfs-http-client'

const profile = {
  name: 'ipfsProvider',
  displayName: 'IPFS service for Remix',
  description: '',
  icon: 'assets/img/fileManager.webp',
  permission: true,
  version: '0.0.1',
  methods: ['get', 'add'],
  kind: 'file-system'
}
class IpfsProvider extends Plugin {
  constructor () {
    super(profile)
    this.ipfsconfig = {
      host: 'ipfs.komputing.org',
      port: 443,
      protocol: 'https',
      ipfsurl: 'https://ipfsgw.komputing.org/ipfs/',
    }
  }
}
module.exports = IpfsProvider
