import React from 'react'
import DropdownMenu, { MenuItem } from './DropdownMenu'

interface RunScriptDropdownProps {
  disabled?: boolean
  onSelect?: (option: string) => void
}

const RunScriptDropdown: React.FC<RunScriptDropdownProps> = ({ disabled, onSelect }) => {
  const items: MenuItem[] = [
    { label: 'Create a new script', onClick: () => onSelect && onSelect('create-script') },
    { label: 'Run with Default', onClick: () => onSelect && onSelect('run-default') },
    { label: 'Run with ZKSync-ethers V6', onClick: () => onSelect && onSelect('run-zksync') },
    { label: 'Run with ethers v6', onClick: () => onSelect && onSelect('run-ethers') },
    { label: 'Open script configuration', onClick: () => onSelect && onSelect('open-config') }
  ]

  return <DropdownMenu items={items} disabled={disabled} />
}

export default RunScriptDropdown