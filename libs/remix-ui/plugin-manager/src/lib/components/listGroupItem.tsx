import React from 'react'
import { Profile } from '../../customTypes'

interface ListGroupItemProps {
  activeProfiles: Profile[]
  inactiveProfiles: Profile[]
  renderItem: (profile: Profile) => void
}

function ListGroupItem ({ activeProfiles, inactiveProfiles, renderItem }: ListGroupItemProps) {
  return (
    <div className="list-group list-group-flush plugins-list-group" data-id="pluginManagerComponentActiveTile">
      { activeProfiles.length > 0
        ? activeProfiles.map(profile => renderItem(profile))
        : inactiveProfiles.map(profile => renderItem(profile))
      }
    </div>
  )
}

export default ListGroupItem
