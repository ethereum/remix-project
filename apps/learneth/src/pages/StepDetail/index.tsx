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

  useEffect(() => {
    setClonedStep(null)
    const clonedStep = JSON.parse(JSON.stringify(step))
    const loadFiles = async () => {
      async function loadFile(step, fileType) {
        if (step[fileType] && step[fileType].file && !step[fileType].content) {
          clonedStep[fileType].content = (await remixClient.call('contentImport', 'resolve', step[fileType].file)).content;
        }
      }

      const fileTypes = ['markdown', 'solidity', 'test', 'answer', 'js', 'vy'];
      for (const fileType of fileTypes) {
        await loadFile(step, fileType);
      }
    }
    loadFiles().then(() => {

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

  if (!clonedStep) {
    return (<div className='pb-4'>
      <div className="fixed-top">
        <div className="bg-light">
          <BackButton entity={entity} />
        </div>
      </div>
      loading...
    </div>
    )
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
          <h1 className="ps-3 pe-3 pt-3 pb-1">{clonedStep.name}</h1>
          <button
            className="w-100 nav-item rounded-0 nav-link btn btn-success test"
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
          <h1 className="pe-3 ps-3 pt-3 pb-1">{clonedStep.name}</h1>
        </>
      )}
      <div className="container-fluid">
        <Markdown rehypePlugins={[rehypeRaw]}>{clonedStep.markdown?.content}</Markdown>
      </div>
      {clonedStep.test?.content ? (
        <>
          <div className="mt-3 px-2">
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
          </div>
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
          <div className="mt-3 px-2">
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
                className="w-100 btn btn-success mt-3"
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
          </div>
        </>
      )}
    </div>
  )
}

export default StepDetailPage
