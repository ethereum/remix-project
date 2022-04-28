import { ViewPlugin } from '@remixproject/engine-web'
import * as packageJson from '../../../../../package.json'
import React from 'react' // eslint-disable-line
import { SearchTab } from '@remix-ui/search'
const profile = {
    name: 'search',
    displayName: 'Search in files',
    methods: [''],
    events: [],
    icon: 'assets/img/search_icon.webp',
    description: '',
    kind: '',
    location: 'sidePanel',
    documentation: '',
    version: packageJson.version
  }

export class SearchPlugin extends ViewPlugin {

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