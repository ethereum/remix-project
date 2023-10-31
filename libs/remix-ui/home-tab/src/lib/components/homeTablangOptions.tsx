import React from 'react'
import { Dropdown, DropdownButton } from 'react-bootstrap'
import DropdownItem from "react-bootstrap/DropdownItem";

export function LanguageOptions() {
  const langOptions = ['EN', 'ES', 'FR', 'ZH'] //get languages from locale
  const changeLanguage = (e: any) => {
    //change language
  }
  return (
    <>
      <div className="d-flex align-items-center justify-content-end mx-1">
        <DropdownButton title="EN" id="langdropdown" size="sm">
          {langOptions.map(lang => (
            <DropdownItem as={'span'} onClick={changeLanguage}>{lang}</DropdownItem>
          ))}
        </DropdownButton>
      </div>
    </>
  )
}
