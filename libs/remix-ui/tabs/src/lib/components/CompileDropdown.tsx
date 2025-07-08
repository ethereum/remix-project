import React from 'react'
import DropdownMenu, { MenuItem } from './DropdownMenu'

interface CompileDropdownProps {
  disabled?: boolean
  onSelect?: (option: string) => void
}

const CompileDropdown: React.FC<CompileDropdownProps> = ({ disabled, onSelect }) => {
  const items: MenuItem[] = [
    {
      label: 'Compile and run script',
      submenu: [
        { label: 'scripts/web3-lib.ts', onClick: () => onSelect && onSelect('script1') },
        { label: 'scripts/web3-lib2.ts', onClick: () => onSelect && onSelect('script2') }
      ]
    },
    {
      label: 'Compile and run analysis',
      submenu: [
        { label: 'Run Remix Analysis', onClick: () => onSelect && onSelect('analysis1') },
        { label: 'Run Solidity Scan', onClick: () => onSelect && onSelect('analysis2') }
      ]
    },
    {
      label: 'Compile and publish',
      submenu: [
        { label: 'Publish on IPFS', onClick: () => onSelect && onSelect('publish-ipfs') },
        { label: 'Publish on Swarm', onClick: () => onSelect && onSelect('publish-swarm') }
      ]
    },
    {
      label: 'Open compiler configuration',
      onClick: () => onSelect && onSelect('config')
    }
  ]

  return <DropdownMenu items={items} disabled={disabled} />
}

export default CompileDropdown