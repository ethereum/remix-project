import React, { useEffect, useState } from 'react'
import { Dropdown, DropdownButton } from 'react-bootstrap'
import DropdownItem from "react-bootstrap/DropdownItem";

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

  return (
    <>
      <div className="d-flex align-items-center justify-content-end mr-2">
        <DropdownButton title={langOptions} id="langdropdown" size="sm">
          {['EN', 'ES', 'FR', 'ZH'].map(lang => (
            <DropdownItem as={'span'} onClick={() =>
            {
              changeLanguage(lang.toLowerCase())
              setLangOptions(lang)
            }}
            >
              {lang}
            </DropdownItem>
          ))}
        </DropdownButton>
      </div>
    </>
  )
}
