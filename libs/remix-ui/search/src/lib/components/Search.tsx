import React from 'react'
import { SearchProvider } from '../context/context'
import { Find } from './Find'
import { Results } from './results/Results'
import '../search.css'
import { Include } from './Include'
import { Exclude } from './Exclude'

export const SearchTab = props => {

const plugin = props.plugin

return (
    <>
      <SearchProvider plugin={plugin}>
        <Find></Find>
        <Include></Include>
        <Exclude></Exclude>
        <Results plugin={plugin}></Results>
      </SearchProvider>
    </>
  )
}
