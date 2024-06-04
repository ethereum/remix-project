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
      <div style={{ position: 'absolute', right: "1rem", paddingTop: "0.4rem" }}>
        <Dropdown>
          <Dropdown.Toggle title={langOptions} id="languagedropdown" size="sm" style={{ backgroundColor: 'var(--secondary)', color: 'var(--text)' }}>
            {langOptions}
          </Dropdown.Toggle>
          <Dropdown.Menu className="dropdown-menu langSelector" style={{ paddingTop: "0px", paddingBottom: "0px", minWidth: 'fit-content', backgroundColor: 'var(--body-bg)' }}>
            {['EN', 'ES', 'FR', 'IT', 'KO', 'RU', 'ZH'].map((lang, index) => (
              <DropdownItem as={'span'} className={langOptions === lang ? "border border-primary px-2" : "px-2"} onClick={() =>
              {
                changeLanguage(lang.toLowerCase())
                setLangOptions(lang)
              }}
              style={{ color: 'var(--text)', cursor: 'pointer' }}
              key={index}
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
