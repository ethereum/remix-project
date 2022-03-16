import React from 'react'
import { SearchProvider } from '../context/context'
import { Find } from './Find'
import { Results } from './results/Results'
import '../search.css'
import { Include } from './Include'
import { Exclude } from './Exclude'
import { Replace } from './Replace'
import { OverWriteCheck } from './OverWriteCheck'
import { FindContainer } from './FindContainer'
import { Undo } from './Undo'

export const SearchTab = props => {

const plugin = props.plugin

return (
    <>
    <div className="search_plugin_search_tab px-2">
      <SearchProvider plugin={plugin}>
        <FindContainer></FindContainer>
        <Include></Include>
        <Exclude></Exclude>
        <Undo></Undo>
        <Results></Results>
      </SearchProvider>
    </div>
    </>
  )
}
