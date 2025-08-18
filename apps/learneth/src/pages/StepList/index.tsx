import React, { useMemo } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import BackButton from '../../components/BackButton'
import SlideIn from '../../components/SlideIn'
import { useAppSelector } from '../../redux/hooks'
import './index.scss'

const LEVEL_LABEL: Record<'1'|'2'|'3', string> = { '1': 'Beginner', '2': 'Intermediate', '3': 'Advanced' }

function mdToPlain(text: string, maxLen = 220) {
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

const Antenna = ({ level }: { level: number }) => {
  const active = Math.min(Math.max(level, 0), 3)
  return (
    <span className="antenna d-inline-flex align-items-end">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className={`antenna-bar ${i < active ? 'bg-primary' : 'bg-secondary'}`}
          style={{ height: `${8 + i * 4}px` }}
        />
      ))}
    </span>
  )
}

const ChecklistIcon = () => (
  <svg className="stat-svg" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 7l2 2 3-3" className="chk" />
    <rect x="11" y="6" width="9" height="2" className="ln" rx="1" />
    <path d="M4 13l2 2 3-3" className="chk" />
    <rect x="11" y="12" width="9" height="2" className="ln" rx="1" />
    <path d="M4 19l2 2 3-3" className="chk" />
    <rect x="11" y="18" width="9" height="2" className="ln" rx="1" />
  </svg>
)

export default function StepListPage(): JSX.Element {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const id = queryParams.get('id') as string
  const { detail, selectedId } = useAppSelector((s) => s.workshop)
  const repo = detail[selectedId]
  const entity = repo?.entities?.[id] || {}

  const navigate = useNavigate()

  const { levelNum, levelText } = useMemo(() => { 
    let found: string | undefined
    if (repo?.group) {
      for (const key of Object.keys(repo.group)) {
        if ((repo.group[key] || []).some((it: any) => it.id === id)) { found = key; break }
      }
    }
    const k = (found as '1'|'2'|'3') || '1'
    return { levelNum: Number(k), levelText: LEVEL_LABEL[k] }
  }, [repo, id])

  const steps = entity?.steps || []
  const stepsLen = steps.length
  const durationH = entity?.metadata?.data?.duration
  const prerequisites = entity?.metadata?.data?.prerequisites || 'None'
  const subtitleTags: string[] = entity?.metadata?.data?.tags || []
  const subtitle = subtitleTags.join(', ')
  const description =
    entity?.description?.content ? mdToPlain(entity.description.content, 260)
    : entity?.text ? mdToPlain(entity.text, 260)
    : ''

  const stepMinutes = (step: any): string => {
    const m = step?.metadata?.data?.minutes ?? step?.metadata?.data?.durationMinutes
    return typeof m === 'number' && m > 0 ? `${m} min` : ''
  }

  return (
    <>
      <div className="fixed-top">
        <div className="bg-light">
          <BackButton />
        </div>
      </div>

      <div className="menuspacer" />

      <div className="container-fluid">
        <article className="card course-hero mb-3 border border-secondary">
          <div className="card-body">
            <h2 className="h4 mb-2">{entity?.name}</h2>
            {!!subtitle && <div className="text-muted mb-2">{subtitle}</div>}
            {!!description && <p className="text-muted mb-3">{description}</p>}

            <button
              type="button"
              className="btn btn-cta no-wiggle-btn btn-sm w-100 d-flex align-items-center justify-content-center"
              onClick={() => {
                (window as any)._paq?.push(['trackEvent', 'learneth', 'start_course', id])
                navigate(`/detail?id=${id}&stepId=0`)
              }}
            >
              <span className="no-wiggle-label">Start the course now</span>
              <i className="fas fa-play no-wiggle-icon" aria-hidden="true"></i>
            </button>
          </div>
        </article>

        <section className="stats-row row mb-3">
          <div className="col-6 col-md-3">
            <div className="stat">
              <i className="fas fa-hourglass-half stat-icon" aria-hidden="true" />
              <div>
                <div className="stat-label">Complete time</div>
                <div className="stat-value">
                  {durationH ? `${durationH} hour${Number(durationH) > 1 ? 's' : ''}` : '—'}
                </div>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="stat">
              <i className="fas fa-book stat-icon" aria-hidden="true" />
              <div>
                <div className="stat-label">Chapters</div>
                <div className="stat-value">{stepsLen || 0}</div>
              </div>
            </div> 
          </div> 
          <div className="col-6 col-md-3">
            <div className="stat">
              <Antenna level={levelNum} />  
              <div>
                <div className="stat-label">Level</div>
                <div className="stat-value">{levelText}</div>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="stat">
              <ChecklistIcon />
              <div>
                <div className="stat-label">Prerequisites</div>
                <div className="stat-value">{prerequisites || 'None'}</div>
              </div>
            </div>
          </div>
        </section>

        <hr className="hr-themed my-3" />

        <div className="d-flex align-items-baseline justify-content-between mb-2">
          <h3 className="h6 m-0">Syllabus</h3>
          <div className="small text-muted">{stepsLen} chapters</div>
        </div>

        <SlideIn>
          <div className="list-group syllabus-list">
            {steps.map((step: any, i: number) => (
              <Link
                key={i}
                to={`/detail?id=${id}&stepId=${i}`}
                className="list-group-item list-group-item-action d-flex align-items-center justify-content-between syllabus-item"
                onClick={() => (window as any)._paq?.push(['trackEvent', 'learneth', 'step_slide_in', `${id}/${i}/${step.name}`])}
              >
                <span className="text-truncate">{step.name}</span>
                <span className="d-flex align-items-center text-muted">
                  <span className="small mr-2">{stepMinutes(step)}</span>
                  <i className="fas fa-chevron-right opacity-75" aria-hidden="true"></i>
                </span>
              </Link>
            ))}
          </div>
        </SlideIn>
      </div>
    </>
  )
}
