import React from 'react'
import { Link } from 'react-router-dom'
import { useAppSelector } from '../../redux/hooks'
import RepoImporter from '../../components/RepoImporter'
import './index.css'

type LevelKey = '1' | '2' | '3'
const LEVEL_LABEL: Record<LevelKey, string> = { '1': 'Beginner', '2': 'Intermediate', '3': 'Advanced' }

function Antenna({ level }: { level: number }) {
  const active = Math.min(Math.max(level, 0), 3)
  return (
    <span className="d-inline-flex align-items-end mr-2">
      {[0,1,2].map(i => (
        <span key={i}
          className={`antenna-bar ${i < active ? 'bg-primary' : 'bg-secondary'}`}
          style={{ height: `${8 + i*4}px` }} />
      ))}
    </span>
  )
}

function mdToPlain(text: string, maxLen = 280) {
  if (!text) return ''
  let t = text
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)]\([^)]*\)/g, '$1')
    .replace(/<\/?[^>]+>/g, ' ')
    .replace(/^#+\s+/gm, '')
    .replace(/[*_>#-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return t.length > maxLen ? t.slice(0, maxLen - 1) + '…' : t
}

function MetaRight({ stepsLen, duration }: { stepsLen?: number; duration?: string | number }) {
  const parts: string[] = []
  if (duration) parts.push(`${duration} hour${Number(duration) > 1 ? 's' : ''}`)
  if (stepsLen) parts.push(`${stepsLen} chapter${stepsLen > 1 ? 's' : ''}`)
  return parts.length ? <div className="text-muted small">{parts.join(' · ')}</div> : null
}

export default function HomePage(): JSX.Element {
  const { list, detail, selectedId } = useAppSelector((s) => s.workshop)
  const selectedRepo = detail[selectedId]

   return (
    <div className="App">
      <RepoImporter list={list} selectedRepo={selectedRepo || {}} />

      {selectedRepo && (
        <div className="container-fluid">
          {Object.keys(selectedRepo.group).flatMap((levelKey: string) => {
            const items = selectedRepo.group[levelKey]
            const levelNum = Number(levelKey) || 1
            const levelText = LEVEL_LABEL[levelKey as LevelKey] ?? 'Beginner'

            return items.map((item: any) => {  
              const entity = selectedRepo.entities[item.id] || {}
              const id = item.id
              const tags: string[] = entity?.metadata?.data?.tags || []
              const subtitle = tags.join(', ')
              const stepsLen = entity?.steps?.length
              const duration = entity?.metadata?.data?.duration
              const preview = mdToPlain(entity?.description?.content || '', 280)

              return (
                <article key={id} className="card card-hover mb-3 border border-secondary overflow-hidden">
                  <div className="card-header d-flex justify-content-between align-items-center bg-transparent border-secondary px-3 py-2">
                    <div className="d-flex align-items-center">
                      <Antenna level={levelNum} />
                      <span className="text-muted small">{levelText}</span>
                    </div>
                    <MetaRight stepsLen={stepsLen} duration={duration} />
                  </div>
                  <div className="card-body">
                    <h5 className="card-title mb-1 title-clamp-2">{entity?.name}</h5>
                    {subtitle && <div className="text-muted subtitle-clamp-1">{subtitle}</div>}
                    <p className="mt-2 mb-0 text-muted body-clamp-4">{preview}</p>
                    <Link to={`/list?id=${id}`} className="stretched-link" />
                  </div>
                </article>
              )
            })
          })}
        </div>
      )}
    </div>
  )
}
