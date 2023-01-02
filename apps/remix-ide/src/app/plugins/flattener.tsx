import { ViewPlugin } from '@remixproject/engine-web'
import { FlattenerUI } from 'libs/remix-ui/flattener'
import React from 'react' // eslint-disable-line

const profile = {
  name: 'flattener',
  displayName: 'Flattener',
  description: 'Flattens compiled smart contracts',
  methods: ["flattenAndSave", "flatten", "flattenFile", "flattenFileCustomAction"],
  location: 'sidePanel',
  events: []
}

export class Flattener extends ViewPlugin {
  constructor () {
    super(profile)
  }

  render () {
    return <FlattenerUI plugin={this}></FlattenerUI>
  }


}