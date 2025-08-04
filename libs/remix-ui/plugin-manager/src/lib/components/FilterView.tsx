import React, { useState } from 'react'

const ChevronRight = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

interface FilterViewProps {
  categories: string[];
  selectedCategories: string[];
  setSelectedCategories: (categories: string[]) => void;
}

const FilterView = ({ categories, selectedCategories, setSelectedCategories }: FilterViewProps) => {
  const [isOpen, setIsOpen] = useState(true);

  const handleCheckboxChange = (category: string) => {
    const newSelection = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category]
    setSelectedCategories(newSelection)
  };
  
  const clearFilters = () => {
    setSelectedCategories([])
  };

  return (
    <div data-id="filter-panel" className="filter-panel my-2 bg-light border p-3">
      <div className="filter-header mb-2">
        <span className="filter-title">Filters</span>
        <button onClick={clearFilters} className="clear-filters-btn" data-id="clear-filters-btn">
          <span className="clear-filters-icon mr-1">&times;</span> Clear filters
        </button>
      </div>

      <div className="filter-group">
        <button className="filter-group-header py-2" onClick={() => setIsOpen(!isOpen)}>
          <span>CATEGORY</span>
          <span className={`chevron-icon ${isOpen ? 'open' : ''}`}><ChevronRight /></span>
        </button>
        {isOpen && (
          <div className="filter-group-body pb-2 pt-2">
            {categories.map(category => {
              const checkboxId = `filter-checkbox-${category.replace(/[^a-zA-Z0-9]/g, '')}`;
              return (
                <div className="custom-control custom-checkbox mb-1" key={category}>
                  <input
                    type="checkbox"
                    className="custom-control-input"
                    id={checkboxId}
                    data-id={checkboxId}
                    checked={selectedCategories.includes(category)}
                    onChange={() => handleCheckboxChange(category)}
                  />
                  <label
                    className="custom-control-label"
                    htmlFor={checkboxId}
                    data-id={`filter-label-${category.replace(/[^a-zA-Z0-9]/g, '')}`}
                  >
                    {category}
                  </label>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default FilterView