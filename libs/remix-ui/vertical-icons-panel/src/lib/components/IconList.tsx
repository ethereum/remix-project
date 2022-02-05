import { IconRecord } from '../types'
import Icon from './Icon'
interface OtherIconsProps {
  verticalIconsPlugin: any
  itemContextAction: (e: any, name: string, documentation: string) => Promise<void>
  icons: IconRecord[]
  theme: string
}

function IconList ({ verticalIconsPlugin, itemContextAction, icons, theme }: OtherIconsProps) {
  return (
    <div id="otherIcons">
      {
        icons
          .map(p => (
            <Icon
              theme={theme}
              iconRecord={p}
              verticalIconPlugin={verticalIconsPlugin}
              contextMenuAction={itemContextAction}
              key={
                p.profile.name
              }
            />
          ))}
    </div>
  )
}

export default IconList
