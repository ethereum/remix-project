import React, {useState, useEffect, useRef} from 'react'
import Fuse from 'fuse.js'

interface DropdownItem {
  value: string
  name: string
}

interface DropdownProps {
  label: string
  options: DropdownItem[]
  id: string
  value: string
  onChange: (value: string) => void
}

export const SearchableDropdown: React.FC<DropdownProps> = ({options, label, id, value, onChange}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedOption, setSelectedOption] = useState<DropdownItem | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [filteredOptions, setFilteredOptions] = useState<DropdownItem[]>(options)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const fuse = new Fuse(options, {
    keys: ['name'],
    threshold: 0.3,
  })

  useEffect(() => {
    if (searchTerm === '') {
      setFilteredOptions(options)
    } else {
      const result = fuse.search(searchTerm)
      setFilteredOptions(result.map(({item}) => item))
    }
  }, [searchTerm, options])

  // Close dropdown when user clicks outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    onChange(e.target.value)
    setIsOpen(true)
  }

  const handleOptionClick = (option: DropdownItem) => {
    setSelectedOption(option)
    setSearchTerm(option.name)
    setIsOpen(false)
  }

  const openDropdown = () => {
    setIsOpen(true)
    setSearchTerm('')
  }

  if (!options || options.length === 0) {
    return (
      <div className="dropdown">
        <label htmlFor={id}>{label}</label>
        <div>Loading chains...</div>
      </div>
    )
  }

  return (
    <div className="dropdown" ref={dropdownRef}>
      {' '}
      {/* Add ref here */}
      <label htmlFor={id}>{label}</label>
      <input type="text" value={searchTerm} onChange={handleInputChange} onClick={openDropdown} placeholder="Select a chain" className="form-control" />
      {isOpen && (
        <ul className="dropdown-menu show w-100" style={{maxHeight: '400px', overflowY: 'auto'}}>
          {filteredOptions.map((option) => (
            <li key={option.value} onClick={() => handleOptionClick(option)} className={`dropdown-item ${selectedOption === option ? 'active' : ''}`} style={{cursor: 'pointer', whiteSpace: 'normal'}}>
              {option.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
