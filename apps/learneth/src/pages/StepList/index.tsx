import React, {useContext, useEffect} from 'react'
import {Link, useLocation} from 'react-router-dom'
import Markdown from 'react-markdown'
import BackButton from '../../components/BackButton'
import SlideIn from '../../components/SlideIn'
import {AppContext} from '../../contexts'
import './index.scss'
import { hyphenateString } from '../../utils'

function StepListPage(): JSX.Element {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const id = queryParams.get('id') as string
  const {appState} = useContext(AppContext)
  const [entity, setEntity] = React.useState(null)

  useEffect(() => {
    const { detail, selectedId } = appState.workshop
    const { ids, entities } = detail[selectedId]
    for (let i = 0; i < ids.length; i++) {
      const entity = entities[ids[i]]
      if (entity.metadata.data.id === id) {
        setEntity(entity)
        break
      }
    }
  },[appState])

  if(!entity) {
    return null
  }

  return (
    <>
      <div className="fixed-top">
        <div className="bg-light">
          <BackButton />
        </div>
      </div>
      <div id="top"></div>
      <h1 className="pl-3 pr-3 pt-3 pb-1 mt-5 text-break text-start">{entity.name}</h1>
      <div className="container-fluid">
        <Markdown>{entity.text}</Markdown>
      </div>
      <SlideIn>
        <article className="list-group m-3">
          {entity.steps.map((step: any, i: number) => (
            <Link data-id={`steplist-${hyphenateString(step.name)}`} key={i} to={`/detail?id=${id}&stepId=${i}`} className="rounded-0 btn btn-light border-bottom text-left text-decoration-none">
              {step.name} »
            </Link>
          ))}
        </article>
      </SlideIn>
    </>
  )
}

export default StepListPage
