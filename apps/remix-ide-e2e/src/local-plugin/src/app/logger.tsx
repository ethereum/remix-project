import React, { useEffect, useState } from 'react'
import { useBehaviorSubject } from './usesubscribe/index'
import { client } from './app'

interface loggerProps {
    append: boolean
}

export const Logger: React.FC<loggerProps> = (props) => {
  const log = useBehaviorSubject(client.feedback)
  const [value, setValue] = useState<string>('')

  useEffect(() => {
    setValue(value => {
      const addValue = typeof log === 'string' ? log : JSON.stringify(log)
      return props.append ? `${value} ${addValue}` : addValue
    })
  }, [log])

  return (<div id='log'>{value}</div>)
}
