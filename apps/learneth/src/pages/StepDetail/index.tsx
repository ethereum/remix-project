import React, { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Markdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import BackButton from '../../components/BackButton'
import { useAppSelector, useAppDispatch } from '../../redux/hooks'
import './index.scss'
import remixClient from '../../remix-client'

function StepDetailPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const [clonedStep, setClonedStep] = React.useState(null)
  const [loading, setLoading] = React.useState(false)
  const queryParams = new URLSearchParams(location.search)
  const id = queryParams.get('id') as string
  const stepId = Number(queryParams.get('stepId'))
  const {
    workshop: { detail, selectedId },
    remixide: { errorLoadingFile, errors, success },
  } = useAppSelector((state: any) => state)
  const entity = detail[selectedId].entities[id]
  const steps = entity.steps
  const step = steps[stepId]
  console.log(step)

  useEffect(() => {

    const clonedStep =  JSON.parse(JSON.stringify(step))
    const loadFiles = async () => {
      if (step.markdown && step.markdown.file && !step.markdown.content) {
        console.log('loading md file', step.markdown.file)
        clonedStep.markdown.content = (await remixClient.call('contentImport', 'resolve', step.markdown.file)).content
      }
      if (step.solidity && step.solidity.file && !step.solidity.content) {
        console.log('loading sol file', step.solidity.file)
        clonedStep.solidity.content = (await remixClient.call('contentImport', 'resolve', step.solidity.file)).content
      }
      if (step.test && step.test.file && !step.test.content) {
        console.log('loading test file', step.test.file)
        clonedStep.test.content = (await remixClient.call('contentImport', 'resolve', step.test.file)).content
      }
      if (step.answer && step.answer.file && !step.answer.content) {
        console.log('loading answer file', step.answer.file)
        clonedStep.answer.content = (await remixClient.call('contentImport', 'resolve', step.answer.file)).content
      }
      if(step.js && step.js.file && !step.js.content) {
        console.log('loading js file', step.js.file)
        clonedStep.js.content = (await remixClient.call('contentImport', 'resolve', step.js.file)).content
      }
      if(step.vy && step.vy.file && !step.vy.content) {
        console.log('loading vy file', step.vy.file)
        clonedStep.vy.content = (await remixClient.call('contentImport', 'resolve', step.vy.file)).content
      }
    }
    loadFiles().then(() => {
      console.log('displayFile', clonedStep)
      setClonedStep(clonedStep)
      dispatch({
        type: 'remixide/displayFile',
        payload: clonedStep,
      })
      dispatch({
        type: 'remixide/save',
        payload: { errors: [], success: false },
      })
      window.scrollTo(0, 0)
    })
  }, [step])

  useEffect(() => {
    if (errors.length > 0 || success) {
      window.scrollTo(0, document.documentElement.scrollHeight)
    }
  }, [errors, success])

  if(!clonedStep) {
    return null
  }

  return (
    <div className='pb-4'>
      <div className="fixed-top">
        <div className="bg-light">
          <BackButton entity={entity} />
        </div>
      </div>
      <div id="top"></div>
      {errorLoadingFile ? (
        <>
          <div className="errorloadingspacer"></div>
          <h1 className="pl-3 pr-3 pt-3 pb-1">{clonedStep.name}</h1>
          <button
            className="w-100nav-item rounded-0 nav-link btn btn-success test"
            onClick={() => {
              dispatch({
                type: 'remixide/displayFile',
                payload: clonedStep,
              })
            }}
          >
            Load the file
          </button>
          <div className="mb-4"></div>
        </>
      ) : (
        <>
          <div className="menuspacer"></div>
          <h1 className="pr-3 pl-3 pt-3 pb-1">{clonedStep.name}</h1>
        </>
      )}
      <div className="container-fluid">
        <Markdown rehypePlugins={[rehypeRaw]}>{clonedStep.markdown?.content}</Markdown>
      </div>
      {clonedStep.test?.content ? (
        <>
          <nav className="nav nav-pills nav-fill">
            {errorLoadingFile ? (
              <button
                className="nav-item rounded-0 nav-link btn btn-warning test"
                onClick={() => {
                  dispatch({
                    type: 'remixide/displayFile',
                    payload: clonedStep,
                  })
                }}
              >
                Load the file
              </button>
            ) : (
              <>
                {!errorLoadingFile ? (
                  <>
                    <button
                      className="nav-item rounded-0 nav-link btn btn-info test"
                      onClick={() => {
                        dispatch({
                          type: 'remixide/testStep',
                          payload: clonedStep,
                        })
                      }}
                    >
                      Check Answer
                    </button>
                    {clonedStep.answer?.content && (
                      <button
                        className="nav-item rounded-0 nav-link btn btn-warning test"
                        onClick={() => {
                          dispatch({
                            type: 'remixide/showAnswer',
                            payload: clonedStep,
                          })
                        }}
                      >
                        Show answer
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    {!errorLoadingFile && (
                      <>
                        <button
                          className="nav-item rounded-0 nav-link btn btn-success test"
                          onClick={() => {
                            navigate(stepId === steps.length - 1 ? `/list?id=${id}` : `/detail?id=${id}&stepId=${stepId + 1}`)
                          }}
                        >
                          Next
                        </button>
                        {clonedStep.answer?.content && (
                          <button
                            className="nav-item rounded-0 nav-link btn btn-warning test"
                            onClick={() => {
                              dispatch({
                                type: 'remixide/showAnswer',
                                payload: clonedStep,
                              })
                            }}
                          >
                            Show answer
                          </button>
                        )}
                      </>
                    )}
                  </>
                )}
              </>
            )}
          </nav>
          {success && (
            <button
              className="w-100 rounded-0 nav-item nav-link btn btn-success"
              onClick={() => {
                navigate(stepId === steps.length - 1 ? `/list?id=${id}` : `/detail?id=${id}&stepId=${stepId + 1}`)
              }}
            >
              Next
            </button>
          )}
          <div id="errors">
            {success && (
              <div className="alert rounded-0 alert-success mb-0 mt-0" role="alert">
                Well done! No errors.
              </div>
            )}
            {errors.length > 0 && (
              <>
                {!success && (
                  <div className="alert rounded-0 alert-danger mb-0 mt-0" role="alert">
                    Errors
                  </div>
                )}
                {errors.map((error: string, index: number) => (
                  <div key={index} className="alert rounded-0 alert-warning mb-0 mt-0">
                    {error}
                  </div>
                ))}
              </>
            )}
          </div>
        </>
      ) : (
        <>
          <nav className="nav nav-pills nav-fill">
            {!errorLoadingFile && clonedStep.answer?.content && (
              <button
                className="nav-item rounded-0 nav-link btn btn-warning test"
                onClick={() => {
                  dispatch({
                    type: 'remixide/showAnswer',
                    payload: clonedStep,
                  })
                }}
              >
                Show answer
              </button>
            )}
          </nav>
          {stepId < steps.length - 1 && (
            <button
              className="w-100 btn btn-success"
              onClick={() => {
                navigate(`/detail?id=${id}&stepId=${stepId + 1}`);
                (window as any)._paq.push(['trackEvent', 'learneth', 'navigate_next', `${id}/${stepId + 1}`])
              }}
            >
              Next
            </button>
          )}
          {stepId === steps.length - 1 && (
            <button
              className="w-100 btn btn-success"
              onClick={() => {
                navigate(`/list?id=${id}`);
                (window as any)._paq.push(['trackEvent', 'learneth', 'navigate_finish', id])
              }}
            >
              Finish tutorial
            </button>
          )}
        </>
      )}
    </div>
  )
}

export default StepDetailPage
