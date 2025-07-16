import React from 'react'
import DropdownMenu, { MenuItem } from './DropdownMenu'
import ArrowRight from '../../assets/icons/ArrowRightBig'
import NewScript from '../../assets/icons/NewScript'
import ScriptConfig from '../../assets/icons/ScriptConfig'

interface RunScriptDropdownProps {
  disabled?: boolean
  plugin?: any
  onNotify?: (msg: string) => void
  onRun: (runnerKey: string) => void
}

const RunScriptDropdown: React.FC<RunScriptDropdownProps> = ({ plugin, disabled, onRun, onNotify }) => {
  const items: MenuItem[] = [
    { label: 'Create a new script', icon: <NewScript />, onClick: () => onRun('new_script'), borderBottom: true },
    { label: 'Run with Default', icon: <ArrowRight />, onClick: () => onRun('default') },
    { label: 'Run with Ethers v6', icon: <ArrowRight />, onClick: () => onRun('ethers6') },
    { label: 'Run with ZkSync-ethers v6', icon: <ArrowRight />, onClick: () => onRun('zksyncv6') },
    { label: 'Run with Viem', icon: <ArrowRight />, onClick: () => onRun('viem') },
    { label: 'Run with Chainlink', icon: <ArrowRight />, onClick: () => onRun('chainlink') },
    { label: 'Run with Noir', icon: <ArrowRight />, onClick: () => onRun('noir') },
    { label: 'Run with Circles', icon: <ArrowRight />, onClick: () => onRun('circles-sdk') },
    { label: 'Open script configuration', icon: <ScriptConfig />, borderTop: true, onClick: async () => {
      await plugin.call('manager', 'activatePlugin', 'UIScriptRunner')
      await plugin.call('tabs', 'focus', 'UIScriptRunner')
      onNotify?.("Opened script configuration")
    }}
  ]

  return <DropdownMenu items={items} disabled={disabled} />
}

export default RunScriptDropdown