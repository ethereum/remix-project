import { ViewPlugin } from '@remixproject/engine-web'
import * as packageJson from '../../../../../package.json'
import React from 'react' // eslint-disable-line
import { PluginViewWrapper } from '@remix-ui/helper'
import { SearchTab } from '@remix-ui/search'
const profile = {
    name: 'search',
    displayName: 'Search',
    methods: [''],
    events: [],
    icon: 'assets/img/Search_Icon.svg',
    description: '',
    kind: '',
    location: 'sidePanel',
    documentation: '',
    version: packageJson.version
  }

export class SearchPlugin extends ViewPlugin {
    dispatch: React.Dispatch<any> = () => {}
    constructor () {
      super(profile)
    }
    

    render() {      
        return (
          <div id='searchTab'>
            <SearchTab plugin={this}></SearchTab>
          </div>
        );
      }

}