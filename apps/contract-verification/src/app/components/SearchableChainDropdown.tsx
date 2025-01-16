import React, { useState, useEffect, useRef, useMemo } from 'react'
import Fuse from 'fuse.js'
import type { Chain } from '../types'
import { AppContext } from '../AppContext'
import { useIntl } from 'react-intl'

function getChainDescriptor(chain: Chain): string {
  if (!chain) return ''
  return `${chain.title || chain.name} (${chain.chainId})`
}

interface DropdownProps {
  label: string | any
  id: string
  setSelectedChain: (chain: Chain) => void
  selectedChain: Chain
}

export const SearchableChainDropdown: React.FC<DropdownProps> = ({ label, id, setSelectedChain, selectedChain }) => {
  const { chains } = React.useContext(AppContext)
  const ethereumChainIds = [1, 11155111, 17000]
  const intl = useIntl()

  // Add Ethereum chains to the head of the chains list. Sort the rest alphabetically
  const dropdownChains = useMemo(
    () =>
      chains.sort((a, b) => {
        const isAInEthereum = ethereumChainIds.includes(a.chainId)
        const isBInEthereum = ethereumChainIds.includes(b.chainId)

        if (isAInEthereum && !isBInEthereum) return -1
        if (!isAInEthereum && isBInEthereum) return 1
        if (isAInEthereum && isBInEthereum) return ethereumChainIds.indexOf(a.chainId) - ethereumChainIds.indexOf(b.chainId)

        return (a.title || a.name).localeCompare(b.title || b.name)
      }),
    [chains]
  )

  const [searchTerm, setSearchTerm] = useState(selectedChain ? getChainDescriptor(selectedChain) : '')
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const fuse = new Fuse(dropdownChains, {
    keys: ['name', 'chainId', 'title'],
    threshold: 0.3,
  })

  const filteredOptions = searchTerm ? fuse.search(searchTerm).map(({ item }) => item) : dropdownChains

  // Close dropdown when user clicks outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm(getChainDescriptor(selectedChain))
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [selectedChain])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setIsOpen(true)
  }

  const handleOptionClick = (option: Chain) => {
    setSelectedChain(option)
    setSearchTerm(getChainDescriptor(option))
    setIsOpen(false)
  }

  const openDropdown = () => {
    setIsOpen(true)
    setSearchTerm('')
  }

  if (!dropdownChains || dropdownChains.length === 0) {
    return (
      <div className="dropdown">
        <label htmlFor={id}>{label}</label>
        <div>Loading chains...</div>
      </div>
    )
  }

  return (
    <div className="dropdown mb-3" ref={dropdownRef}>
      {' '}
      {/* Add ref here */}
      <label htmlFor={id}>{label}</label>
      <input type="text" value={searchTerm} onChange={handleInputChange} onClick={openDropdown} data-id="chainDropdownbox" placeholder={intl.formatMessage({ id: "contract-verification.searchableChainDropdown", defaultMessage: "Select a chain" })} className="form-control" />
      <ul className="dropdown-menu show w-100 bg-light" style={{ maxHeight: '400px', overflowY: 'auto', display: isOpen ? 'initial' : 'none' }}>
        {filteredOptions.map((chain) => (
          <li key={chain.chainId} onClick={() => handleOptionClick(chain)} data-id={chain.chainId} className={`dropdown-item text-dark ${selectedChain?.chainId === chain.chainId ? 'active' : ''}`} style={{ cursor: 'pointer', whiteSpace: 'normal' }}>
            {getChainDescriptor(chain)}
          </li>
        ))}
      </ul>
    </div>
  )
}
