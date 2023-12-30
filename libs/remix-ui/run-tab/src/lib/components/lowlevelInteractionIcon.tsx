import { CustomTooltip } from '@remix-ui/helper'
import React, { useEffect, useState } from 'react'
import { FormattedMessage } from 'react-intl'
import { RunTab } from '../types/run-tab'

export type LowLevelInteractionIconProps = {
  plugin: RunTab
}

export function LowLevelInteractionIcon (props: LowLevelInteractionIconProps) {
  const [version, setVersion] = useState('')

  useEffect(() => {
    const listenForCompileFinished = async () => {
      props.plugin.on('solidity', 'compilationFinished',
        (file: string, source, languageVersion, data, input, version) => {
          const versionUpdate = `v${version.split('+')[0]}` // remove commit hash
          console.log(versionUpdate)
          setVersion(versionUpdate)
        })
    }
    listenForCompileFinished()

    return () => {
      props.plugin.off('solidity', 'compilationFinished')
    }
  }, [])

  return (
    <>
      <CustomTooltip placement={'bottom-end'} tooltipClasses="text-wrap" tooltipId="receiveEthDocstoolTip" tooltipText={<FormattedMessage id="udapp.tooltipText8" />}>
        <a href={`https://solidity.readthedocs.io/en/${version}/contracts.html#receive-ether-function`} target="_blank" rel="noreferrer">
          <i aria-hidden="true" className="fas fa-info my-2 mr-1"></i>
        </a>
      </CustomTooltip>
    </>
  )
}
