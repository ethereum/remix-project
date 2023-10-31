import React, { useState } from 'react'
import { Dropdown, DropdownButton } from 'react-bootstrap'
import DropdownItem from "react-bootstrap/DropdownItem";

export function LanguageOptions({ plugin }: { plugin: any }) {
  const [langOptions, setLangOptions] = useState<string>('') //get languages from locale
  const changeLanguage = async (lang: string) => {
    await plugin.call('locale', 'switchLocale', lang)
  }
  return (
    <>
      <div className="d-flex align-items-center justify-content-end mx-1">
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
