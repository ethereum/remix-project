import React from 'react'
import { Profile } from '../../customTypes'
import RenderItem from './renderItem'

interface ListGroupItemProps {
  activeProfiles: Profile[]
  inactiveProfiles: Profile[]
}

function ListGroupItem ({ activeProfiles, inactiveProfiles }: ListGroupItemProps) {
  return (
    <div className="list-group list-group-flush plugins-list-group" data-id="pluginManagerComponentActiveTile">
      { activeProfiles.length > 0
        ? activeProfiles.map(profile => (
          <RenderItem profile={profile} />
        ))
        : inactiveProfiles.map(profile => (
          <RenderItem profile={profile}/>
        ))
      }
    </div>
  )
}

export default ListGroupItem
