import React, { useEffect, useState } from 'react'
import { Dropdown, DropdownButton } from 'react-bootstrap'
import DropdownItem from 'react-bootstrap/DropdownItem'
import { localeLang } from './types/carouselTypes'



export function LanguageOptions({ plugin }: { plugin: any }) {
  const [langOptions, setLangOptions] = useState<string>()

  const changeLanguage = async (lang: string) => {
    await plugin.call('locale', 'switchLocale', lang)
  }

  useEffect(() => {
    plugin.call('locale', 'currentLocale').then(opt => {
      setLangOptions(opt.code.toUpperCase())
    })
  }, [langOptions])

  useEffect(() => {
    plugin.on('locale', 'localeChanged', (lang: localeLang) => {
      setLangOptions(lang.code.toUpperCase())
    })
  }, [langOptions])

  return (
    <>
      <div className={langOptions !== 'fr' ? `d-flex align-items-center justify-content-end mr-2` : `d-flex align-items-center justify-content-end mr-3`}>
        <Dropdown>
          <Dropdown.Toggle title={langOptions} id="languagedropdown" size="sm">
            {langOptions}
          </Dropdown.Toggle>
          <Dropdown.Menu className="dropdown-menu langSelector" style={{ minWidth: '2rem', backgroundColor: 'var(--body-bg)'}}>
            {['EN', 'ES', 'FR', 'IT', 'ZH'].map(lang => (
              <DropdownItem as={'span'} className="p-2" onClick={() =>
              {
                changeLanguage(lang.toLowerCase())
                setLangOptions(lang)
              }}
              style={{ color: 'var(--text)'}}
              >
                {lang}
              </DropdownItem>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </>
  )
}
