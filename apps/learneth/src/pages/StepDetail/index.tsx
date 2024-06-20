import React, { useContext, useEffect } from 'react'
import { Form, useLocation, useNavigate } from 'react-router-dom'
import Markdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import { FormattedMessage } from 'react-intl'
import BackButton from '../../components/BackButton'
import { AppContext } from '../../contexts'
import { displayFile, loadStepContent, showAnswer, testStep } from '../../actions'

function StepDetailPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { dispatch, appState } = useContext(AppContext)
  const [loaded, setLoaded] = React.useState(false)
  const [content, setContent] = React.useState('loading...')
  const queryParams = new URLSearchParams(location.search)
  const id = queryParams.get('id') as string
  const stepId = Number(queryParams.get('stepId'))
  const {
    workshop: { detail, selectedId },
    remixide: { errorLoadingFile, errors, success },
  } = appState
  const entity = detail[selectedId].entities[id]
  const steps = entity.steps
  const step = steps[stepId]

  useEffect(() => {
    displayFile(step)
    dispatch({
      type: 'SET_REMIXIDE',
      payload: { errors: [], success: false },
    })
    window.scrollTo(0, 0)
    
    if(step.markdown && !step.markdown?.isLoaded && step.markdown.file) {
      loadStepContent(step.markdown.file).then((content) => {
        setLoaded(true)
        if(step.markdown){
         setContent(content)
        }
      })
    }else{
      setLoaded(true)
      setContent(step.markdown.content)
    }
  }, [step])

  useEffect(() => {
    if (errors.length > 0 || success) {
      window.scrollTo(0, document.documentElement.scrollHeight)
    }
  }, [errors, success])

  if (!loaded) {
    return <>
      <div className="fixed-top">
        <div className="bg-light">
          <BackButton entity={entity} />
        </div>
      </div>
      <div id="top">
        <FormattedMessage id="learneth.loading" />
      </div>
    </>
  }
  return (
    <>
      <div className="fixed-top">
        <div className="bg-light">
          <BackButton entity={entity} />
        </div>
      </div>
      <div id="top"></div>
      {errorLoadingFile ? (
        <>
          <div className="pt-5"></div>
          <h1 className="pl-3 pr-3 pt-3 pb-1 text-break text-start">{step.name}</h1>
          <button
            className="w-100nav-item rounded-0 nav-link btn btn-success test"
            onClick={async () => {
              await displayFile(step)
            }}
          >
            <FormattedMessage id="learneth.loadFile" />
          </button>
          <div className="mb-4"></div>
        </>
      ) : (
        <>
          <div className="pt-5"></div>
          <h1 className="pr-3 pl-3 pt-3 pb-1 text-break text-start">{step.name}</h1>
        </>
      )}
      <div className="container-fluid">
        <Markdown rehypePlugins={[rehypeRaw]}>{content}</Markdown>
      </div>
      {step.test ? (
        <>
          <nav className="nav nav-pills nav-fill">
            {errorLoadingFile ? (
              <button
                className="nav-item rounded-0 nav-link btn btn-warning test"
                onClick={async () => {
                  await displayFile(step)
                }}
              >
                <FormattedMessage id="learneth.loadFile" />
              </button>
            ) : (
              <>
                {!errorLoadingFile ? (
                  <>
                    <button
                      className="nav-item rounded-0 nav-link btn btn-info test"
                      onClick={() => {
                        testStep(step)
                      }}
                    >
                      <FormattedMessage id="learneth.checkAnswer" />
                    </button>
                    {step.answer && (
                      <button
                        className="nav-item rounded-0 nav-link btn btn-warning test"
                        onClick={() => {
                          showAnswer(step)
                        }}
                      >
                        <FormattedMessage id="learneth.showAnswer" />
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
                          <FormattedMessage id="learneth.next" />
                        </button>
                        {step.answer && (
                          <button
                            className="nav-item rounded-0 nav-link btn btn-warning test"
                            onClick={() => {
                              showAnswer(step)
                            }}
                          >
                            <FormattedMessage id="learneth.showAnswer" />
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
              <FormattedMessage id="learneth.next" />
            </button>
          )}
          <div id="errors">
            {success && (
              <div className="alert rounded-0 alert-success mb-0 mt-0" role="alert">
                <FormattedMessage id="learneth.wellDone" />
              </div>
            )}
            {errors.length > 0 && (
              <>
                {!success && (
                  <div className="alert rounded-0 alert-danger mb-0 mt-0" role="alert">
                    <FormattedMessage id="learneth.errors" />
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
            {!errorLoadingFile && step.answer && (
              <button
                className="nav-item rounded-0 nav-link btn btn-warning test"
                onClick={async () => {
                  await showAnswer(step)
                }}
              >
                <FormattedMessage id="learneth.showAnswer" />
              </button>
            )}
          </nav>
          {stepId < steps.length - 1 && (
            <button
              className="w-100 btn btn-success"
              onClick={() => {
                navigate(`/detail?id=${id}&stepId=${stepId + 1}`)
              }}
            >
              <FormattedMessage id="learneth.next" />
            </button>
          )}
          {stepId === steps.length - 1 && (
            <button
              className="w-100 btn btn-success"
              onClick={() => {
                navigate(`/list?id=${id}`)
              }}
            >
              <FormattedMessage id="learneth.finishTutorial" />
            </button>
          )}
        </>
      )}
    </>
  )
}

export default StepDetailPage
