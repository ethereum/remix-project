import React, { useState } from 'react'

const ChevronRight = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

interface FilterViewProps {
  categoryMap: Record<number, string>
  selectedCategories: number[]
  setSelectedCategories: (categories: number[]) => void
}

const FilterView = ({ categoryMap, selectedCategories, setSelectedCategories }: FilterViewProps) => {
  const [isOpen, setIsOpen] = useState(true)

  const handleCheckboxChange = (categoryId: number) => {
    const newSelection = selectedCategories.includes(categoryId)
      ? selectedCategories.filter(id => id !== categoryId)
      : [...selectedCategories, categoryId]
    setSelectedCategories(newSelection)
  }
  
  const clearFilters = () => {
    setSelectedCategories([])
  }

  return (
    <div data-id="filter-panel" className="my-2 bg-light border rounded p-3">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <span className="font-weight-bold">Filters</span>
        <button onClick={clearFilters} className="btn btn-sm btn-link text-primary p-0" data-id="clear-filters-btn">
          <span className="font-weight-bold mr-1">&times;</span> Clear filters
        </button>
      </div>
      <div className="border-bottom">
        <button className="d-flex justify-content-between align-items-center w-100 py-2 btn btn-transparent text-secondary p-0" onClick={() => setIsOpen(!isOpen)}>
          <span className="font-size-12">CATEGORY</span>
          <span className={`chevron-icon ${isOpen ? 'open' : ''}`}><ChevronRight /></span>
        </button>
        {isOpen && (
          <div className="filter-group-body pb-2 pt-2">
            {Object.entries(categoryMap).map(([id, name]) => {
              const categoryId = parseInt(id, 10)
              const checkboxId = `filter-checkbox-${categoryId}`
              return (
                <div className="custom-control custom-checkbox mb-1" key={categoryId}>
                  <input
                    type="checkbox"
                    className="custom-control-input"
                    id={checkboxId}
                    data-id={checkboxId}
                    checked={selectedCategories.includes(categoryId)}
                    onChange={() => handleCheckboxChange(categoryId)}
                  />
                  <label
                    className="custom-control-label"
                    htmlFor={checkboxId}
                    data-id={`filter-label-${name.replace(/[^a-zA-Z0-9]/g, '')}`}
                  >
                    {name}
                  </label>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default FilterView