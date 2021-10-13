import React from 'react'
import { useBehaviorSubject } from './usesubscribe/index'
import { client } from './app'

interface loggerProps {

}

export const Logger: React.FC<loggerProps> = ({}) => {
  const log = useBehaviorSubject(client.feedback)
  return (<div id='log'>{typeof log === 'string' ? log : JSON.stringify(log)}</div>)
}
