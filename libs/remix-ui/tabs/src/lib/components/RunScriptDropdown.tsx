import React from 'react'
import DropdownMenu, { MenuItem } from './DropdownMenu'

interface RunScriptDropdownProps {
  disabled?: boolean
  plugin?: any
  onNotify?: (msg: string) => void
}

const RunScriptDropdown: React.FC<RunScriptDropdownProps> = ({ plugin, disabled, onNotify }) => {
  const items: MenuItem[] = [
    { label: 'Create a new script', onClick: () => {} },
    { label: 'Run with Default', onClick: () => {} },
    { label: 'Run with ZKSync-ethers V6', onClick: () => {} },
    { label: 'Run with ethers v6', onClick: () => {} },
    { label: 'Open script configuration', onClick: async () => {
      await plugin.call('manager', 'activatePlugin', 'UIScriptRunner')
      await plugin.call('tabs', 'focus', 'UIScriptRunner')
      onNotify?.("Opened compiler configuration")
    }}
  ]

  return <DropdownMenu items={items} disabled={disabled} />
}

export default RunScriptDropdown