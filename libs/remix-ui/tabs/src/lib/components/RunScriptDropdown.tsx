import React from 'react'
import DropdownMenu, { MenuItem } from './DropdownMenu'

interface RunScriptDropdownProps {
  disabled?: boolean
  plugin?: any
  onNotify?: (msg: string) => void
  onRun: (runnerKey: string) => void
}

const RunScriptDropdown: React.FC<RunScriptDropdownProps> = ({ plugin, disabled, onRun, onNotify }) => {
  const items: MenuItem[] = [
    { label: 'Create a new script', onClick: () => onRun('new_script') },
    { label: 'Run with Default', onClick: () => onRun('default') },
    { label: 'Run with Ethers v6', onClick: () => onRun('ethers6') },
    { label: 'Run with ZkSync-ethers v6', onClick: () => onRun('zksyncv6') },
    { label: 'Run with Viem', onClick: () => onRun('viem') },
    { label: 'Run with Chainlink', onClick: () => onRun('chainlink') },
    { label: 'Run with Noir', onClick: () => onRun('noir') },
    { label: 'Run with Circles', onClick: () => onRun('circles-sdk') },
    { label: 'Open script configuration', onClick: async () => {
      await plugin.call('manager', 'activatePlugin', 'UIScriptRunner')
      await plugin.call('tabs', 'focus', 'UIScriptRunner')
      onNotify?.("Opened script configuration")
    }}
  ]

  return <DropdownMenu items={items} disabled={disabled} />
}

export default RunScriptDropdown