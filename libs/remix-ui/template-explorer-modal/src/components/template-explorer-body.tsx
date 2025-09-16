import React from 'react'
import { TopCard, TopCardProps } from './topCard'
import { TemplateExplorer } from './template-explorer'

export interface TemplateExplorerBodyProps {
  topCards: TopCardProps[]
  plugin: any
}

export function TemplateExplorerBody({ topCards, plugin }: TemplateExplorerBodyProps) {
  return (
    <section>
      <div className="title">
        {/* {props.appState.genericModalState.title && props.appState.genericModalState.title} {props.appState.genericModalState.title} */}
        <div className="d-flex flex-row gap-3 mx-auto">
          {topCards.map((card) => (
            <TopCard key={card.title} {...card} />
          ))}
        </div>
      </div>
      <div className="body">
        <TemplateExplorer plugin={plugin} />
      </div>
    </section>
  )
}
