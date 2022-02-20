import React from 'react'
import { SearchProvider } from '../context/context'
import { Find } from './Find'
import { Results } from './results/Results'
import '../search.css'
import { Include } from './Include'
import { Exclude } from './Exclude'
import { Replace } from './Replace'

export const SearchTab = props => {

const plugin = props.plugin

return (
    <>
    <div className="search_tab">
      <SearchProvider plugin={plugin}>
        <Find></Find>
        <Replace></Replace>
        <Include></Include>
        <Exclude></Exclude>
        <Results></Results>
      </SearchProvider>
    </div>
    </>
  )
}
