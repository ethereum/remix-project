import React, { useState } from 'react'

const ChevronRight = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
    <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export default function FiltersPanel(props: {
  allTags: string[]
  selectedLevels: number[]
  setSelectedLevels: (v: number[]) => void
  selectedTags: string[]
  setSelectedTags: (v: string[]) => void
  onClear: () => void
}) {
  const {
    allTags,
    selectedLevels, setSelectedLevels,
    selectedTags, setSelectedTags,
    onClear
  } = props

  const [openLevel, setOpenLevel] = useState(true)
  const [openTags, setOpenTags] = useState(true)

  const toggleLevel = (lv: number) =>
    setSelectedLevels(selectedLevels.includes(lv) ? selectedLevels.filter(v => v !== lv) : [...selectedLevels, lv])
  const toggleTag = (t: string) =>
    setSelectedTags(selectedTags.includes(t) ? selectedTags.filter(v => v !== t) : [...selectedTags, t])

  return (
    <div className="my-2 bg-light border rounded p-3" data-id="learneth-filter-panel">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <span className="font-weight-bold">Filters</span>
        <button
          onClick={onClear}
          className="btn btn-sm btn-link text-primary p-0 d-inline-flex align-items-center clear-btn"
          data-id="clear-filters-btn"
          type="button"
        >
          <span aria-hidden="true" className="clear-x">×</span>
          <span className="clear-text">Clear filters</span>
        </button>
      </div>

      <div className="border-bottom">
        <button
          className="d-flex justify-content-between align-items-center w-100 py-2 btn btn-transparent text-secondary p-0"
          onClick={() => setOpenLevel(v => !v)}
        >
          <span className="font-size-12">LEVEL</span>
          <span className={`chevron-icon ${openLevel ? 'open' : ''}`}><ChevronRight /></span>
        </button>
        {openLevel && (
          <div className="filter-group-body pb-2 pt-2">
            {[1,2,3].map(lv => (
              <div className="custom-control custom-checkbox mb-1" key={lv}>
                <input type="checkbox" className="custom-control-input" id={`lv-${lv}`}
                  checked={selectedLevels.includes(lv)} onChange={() => toggleLevel(lv)} />
                <label className="custom-control-label filter-check" htmlFor={`lv-${lv}`}>
                  {lv === 1 ? 'Beginner' : lv === 2 ? 'Intermediate' : 'Advanced'}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-bottom">
        <button
          className="d-flex justify-content-between align-items-center w-100 py-2 btn btn-transparent text-secondary p-0"
          onClick={() => setOpenTags(v => !v)}
        >
          <span className="font-size-12">TAGS</span>
          <span className={`chevron-icon ${openTags ? 'open' : ''}`}><ChevronRight /></span>
        </button>
        {openTags && (
          <div className="filter-group-body pb-2 pt-2" style={{ maxHeight: 160, overflow: 'auto' }}>
            {allTags.map(tag => (
              <div className="custom-control custom-checkbox mb-1" key={tag}>
                <input type="checkbox" className="custom-control-input" id={`tag-${tag}`}
                  checked={selectedTags.includes(tag)} onChange={() => toggleTag(tag)} />
                <label className="custom-control-label filter-check" htmlFor={`tag-${tag}`}>{tag}</label>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
