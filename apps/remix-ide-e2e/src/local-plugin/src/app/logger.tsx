import React, { useEffect, useState } from 'react'

import { client } from './app'

interface loggerProps {
  append: boolean,
  log: any
}

export const Logger: React.FC<loggerProps> = (props) => {
  const [value, setValue] = useState<string>('')

  useEffect(() => {
    setValue(value => {
      const addValue = typeof props.log === 'string' ? props.log : JSON.stringify(props.log)
      return props.append ? `${value} ${addValue}` : addValue
    })
  }, [props])

  return (<div className="jumbotron text-break">{value}</div>)
}
