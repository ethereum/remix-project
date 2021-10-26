import React from 'react'
interface loggerProps {
  log: any,
  id: string
}

export const Logger: React.FC<loggerProps> = (props) => {
  return (<div id={props.id} className="jumbotron overflow-auto text-break mb-1 p-2">{props.log}</div>)
}
