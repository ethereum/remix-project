/* eslint-disable prefer-const */
import React from 'react'
import { Plugin } from '@remixproject/engine'
import { CustomRemixApi } from '@remix-api'

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
  constructor() {
    super(profile)
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
    };

    ws.onmessage = async (event) => {
      console.log('Message from server:', event.data);
      const result = await this.call('web3Provider', 'sendAsync', JSON.parse(event.data))
      console.log('Result:', result)
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