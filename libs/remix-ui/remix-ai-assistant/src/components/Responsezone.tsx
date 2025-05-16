import React from 'react'
import DefaultResponseContent from './DefaultResponseContent'

export default function ResponseZone({ response, responseId }: { response: string[], responseId: string }) {
  return (
    <section className="flex-wrap">
      {response.map((item, index) => (
        <span key={`${responseId}-${index}`}>
          {item}
        </span>
      ))}
    </section>
  )
}