import React, {useContext} from 'react'
import {SearchProvider} from '../context/context'
import {Results} from './results/Results'
import '../search.css'
import {Include} from './Include'
import {Exclude} from './Exclude'
import {FindContainer} from './FindContainer'
import {Undo} from './Undo'
import { AppContext } from '@remix-ui/app'

export const SearchTab = (props) => {
  const plugin = props.plugin
  const {platform} = useContext(AppContext)

  return (
    <>
      <div className="search_plugin_search_tab pr-4 px-2 pb-4">
        <SearchProvider platform={platform} plugin={plugin}>
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
