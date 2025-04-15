import React, { useState, useEffect, useRef, useMemo, Ref } from 'react'
import Fuse from 'fuse.js'
import type { Chain } from '../types'
import { AppContext } from '../AppContext'
import intl, { useIntl } from 'react-intl'
import { Dropdown } from 'react-bootstrap'

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

export const CustomToggle = React.forwardRef(
  (
    {
      children,
      onClick,
      icon,
      className = ''
    }: {
      children: React.ReactNode
      onClick: (e) => void
      icon: string
      className: string
    },
    ref: Ref<HTMLButtonElement>
  ) => (
    <button
      ref={ref}
      onClick={(e) => {
        e.preventDefault()
        onClick(e)
      }}
      className={className.replace('dropdown-toggle', '')}
    >
      <div className="d-flex">
        <div className="mr-auto text-nowrap text-truncate overflow-hidden" data-id={`dropdown-content`}>{children}</div>
        {icon && (
          <div className="pr-1">
            <i className={`${icon} pr-1`}></i>
          </div>
        )}
        <div>
          <i className="fad fa-sort-circle"></i>
        </div>
      </div>
    </button>
  )
)

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
    <Dropdown>
      <Dropdown.Toggle as={CustomToggle} icon={null} className="btn btn-light border btn-block w-100 d-inline-block form-control" data-id="chainDropdownbox">
        {searchTerm.length > 0 ? searchTerm : intl.formatMessage({ id: "contract-verification.searchableChainDropdown", defaultMessage: "Select a chain" })}
      </Dropdown.Toggle>
      <Dropdown.Menu className="w-100 custom-dropdown-items border bg-light">
        {filteredOptions.map((chain) => (
          <Dropdown.Item key={chain.chainId} onClick={() => handleOptionClick(chain)}
            className={`${getChainDescriptor(chain).length > 30 ? 'text-truncate text-decoration-none' : 'text-decoration-none'}`}
            data-id={chain.chainId}
          >
            {getChainDescriptor(chain)}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  )
}
