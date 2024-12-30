/* eslint-disable prefer-const */
import React from 'react'
import { Plugin } from '@remixproject/engine'
import { CustomRemixApi } from '@remix-api'
import { Blockchain } from '../../blockchain/blockchain'

const _paq = (window._paq = window._paq || [])

const profile = {
  name: 'desktopClient',
  displayName: 'desktopClient',
  description: '',
  methods: ['init', 'sendAsync'],
  events: ['connected'],
  maintainedBy: 'Remix'
}

export class DesktopClient extends Plugin<any, CustomRemixApi> {
  blockchain: Blockchain
  constructor(blockchain: Blockchain) {
    super(profile)
    this.blockchain = blockchain
  }

  onActivation() {
    console.log('DesktopClient activated')
    _paq.push(['trackEvent', 'plugin', 'activated', 'DesktopClient'])

    this.connectToWebSocket()
  }

  onDeactivation() {
  }

  async connectToWebSocket() {
    const ws = new WebSocket('ws://localhost:8546')
    ws.onopen = () => {
      console.log('Connected to server');
      this.emit('connected', true)
      this.call('menuicons', 'select', 'udapp')
      this.call('manager', 'activatePlugin', 'environmentExplorer').then(() => this.call('tabs' as any, 'focus', 'environmentExplorer'))
      this.blockchain.event.register('contextChanged', async (context) => {
        console.log('Context changed:', context)
        ws.send(JSON.stringify({ type: 'contextChanged', payload: context }))
      })
    };

    ws.onmessage = async (event) => {
      const parsed = JSON.parse(event.data)
      
      const result = await this.call('web3Provider', 'sendAsync', JSON.parse(event.data))
      if(parsed.method === 'eth_sendTransaction') {
        console.log('Message from server:', parsed);
        console.log('Result:', result)
        ws.send(JSON.stringify({ type: 'focus' }))
      }
      ws.send(JSON.stringify(result))
      return result
    };

    ws.onclose = () => {
      console.log('Disconnected from server');
      this.emit('connected', false)
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  async init() {

  }

  async sendAsync(payload: any) {

  }

}