import React from 'react'
import { Profile } from '../../customTypes'
import RenderItem from './renderItem'

interface ListGroupItemProps {
  activeProfiles?: Profile[]
  inactiveProfiles?: Profile[]
}

function ListGroupItem () {
  return (
    <div className="list-group list-group-flush plugins-list-group" data-id="pluginManagerComponentActiveTile">
      {/* { activeProfiles.length > 0
        ? activeProfiles.map(profile => (
          <RenderItem profile={profile} />
        ))
        : inactiveProfiles.map(profile => (
          <RenderItem profile={profile}/>
        ))
      } */}
      <RenderItem />
      <h6 className="h6">List Group Item Component</h6>
    </div>
  )
}

export default ListGroupItem
