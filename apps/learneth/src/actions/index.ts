import {toast} from 'react-toastify'
import axios from 'axios'
import groupBy from 'lodash/groupBy'
import pick from 'lodash/pick'
import remixClient from '../remix-client'
import {router} from '../App'

let dispatch, state

// const apiUrl = 'http://localhost:3001';
const apiUrl = 'https://static.220.14.12.49.clients.your-server.de:3000'

export const repoMap = {
  en: {
    name: 'ethereum/remix-workshops',
    branch: 'master',
  },
  zh: {
    name: 'PlanckerLabs/remix-workshops',
    branch: 'zh',
  },
}

export const initDispatch = (_dispatch) => {
  dispatch = _dispatch
}

export const updateState = (_state) => {
  state = _state
}

export const initWorkshop = async (code) => {
  const cache = localStorage.getItem('workshop.state')

  if (cache) {
    const workshopState = JSON.parse(cache)
    await dispatch({
      type: 'SET_WORKSHOP',
      payload: workshopState,
    })
  } else {
    await loadRepo(repoMap[code])
  }
}

export const loadRepo = async (payload) => {
  toast.info(`loading ${payload.name}/${payload.branch}`)

  await dispatch({
    type: 'SET_LOADING',
    payload: {
      screen: true,
    },
  })

  const {list, detail} = state.workshop

  const url = `${apiUrl}/clone/${encodeURIComponent(payload.name)}/${payload.branch}?${Math.random()}`
  console.log('loading ', url)
  const {data} = await axios.get(url)
  const repoId = `${payload.name}-${payload.branch}`

  for (let i = 0; i < data.ids.length; i++) {
    const {
      steps,
      metadata: {
        data: {steps: metadataSteps},
      },
    } = data.entities[data.ids[i]]

    let newSteps = []

    if (metadataSteps) {
      newSteps = metadataSteps.map((step: any) => {
        return {
          ...steps.find((item: any) => item.name === step.path),
          name: step.name,
        }
      })
    } else {
      newSteps = steps.map((step: any) => ({
        ...step,
        name: step.name.replace('_', ' '),
      }))
    }

    const stepKeysWithFile = ['markdown', 'solidity', 'test', 'answer', 'js', 'vy']

    for (let j = 0; j < newSteps.length; j++) {
      const step = newSteps[j]
      for (let k = 0; k < stepKeysWithFile.length; k++) {
        const key = stepKeysWithFile[k]
        if (step[key]) {
          try {
            step[key].content = (await remixClient.call('contentImport', 'resolve', step[key].file)).content
          } catch (error) {
            console.error(error)
          }
        }
      }
    }
    data.entities[data.ids[i]].steps = newSteps
  }

  const workshopState = {
    detail: {
      ...detail,
      [repoId]: {
        ...data,
        group: groupBy(
          data.ids.map((id: string) => pick(data.entities[id], ['level', 'id'])),
          (item: any) => item.level
        ),
        ...payload,
      },
    },
    list: detail[repoId] ? list : [...list, payload],
    selectedId: repoId,
  }
  await dispatch({
    type: 'SET_WORKSHOP',
    payload: workshopState,
  })
  localStorage.setItem('workshop.state', JSON.stringify(workshopState))

  toast.dismiss()
  await dispatch({
    type: 'SET_LOADING',
    payload: {
      screen: false,
    },
  })

  if (payload.id) {
    const {detail, selectedId} = workshopState
    const {ids, entities} = detail[selectedId]
    for (let i = 0; i < ids.length; i++) {
      const entity = entities[ids[i]]
      if (entity.metadata.data.id === payload.id || i + 1 === payload.id) {
        await router.navigate(`/list?id=${ids[i]}`)
        break
      }
    }
  }
}

export const resetAllWorkshop = async (code) => {
  await dispatch({
    type: 'SET_WORKSHOP',
    payload: {
      list: [],
      detail: {},
      selectedId: '',
    },
  })

  localStorage.removeItem('workshop.state')

  await initWorkshop(code)
}

export const connectRemix = async () => {
  toast.info('connecting to the REMIX IDE')

  await dispatch({
    type: 'SET_LOADING',
    payload: {
      screen: true,
    },
  })

  await remixClient.onload()

  toast.dismiss()

  await dispatch({
    type: 'SET_LOADING',
    payload: {
      screen: false,
    },
  })

  await router.navigate('/home')
}

function getFilePath(file: string): string {
  const name = file.split('/')
  return name.length > 1 ? `${name[name.length - 1]}` : ''
}

export const displayFile = async (step) => {
  let content = ''
  let path = ''
  if (step.solidity?.file) {
    content = step.solidity.content
    path = getFilePath(step.solidity.file)
  }
  if (step.js?.file) {
    content = step.js.content
    path = getFilePath(step.js.file)
  }
  if (step.vy?.file) {
    content = step.vy.content
    path = getFilePath(step.vy.file)
  }

  if (!content) {
    return
  }

  toast.info(`loading ${path} into IDE`)
  await dispatch({
    type: 'SET_LOADING',
    payload: {
      screen: true,
    },
  })

  const {detail, selectedId} = state.workshop

  const workshop = detail[selectedId]
  console.log('loading ', step, workshop)

  path = `.learneth/${workshop.name}/${step.name}/${path}`
  try {
    const isExist = await remixClient.call('fileManager', 'exists' as any, path)
    if (!isExist) {
      await remixClient.call('fileManager', 'setFile', path, content)
    }
    await remixClient.call('fileManager', 'switchFile', `${path}`)
    await dispatch({
      type: 'SET_REMIXIDE',
      payload: {errorLoadingFile: false},
    })
    toast.dismiss()
  } catch (error) {
    toast.dismiss()
    toast.error('File could not be loaded. Please try again.')
    await dispatch({
      type: 'SET_REMIXIDE',
      payload: {errorLoadingFile: true},
    })
  }
  await dispatch({
    type: 'SET_LOADING',
    payload: {
      screen: false,
    },
  })
}

export const testStep = async (step) => {
  await dispatch({
    type: 'SET_LOADING',
    payload: {
      screen: true,
    },
  })

  try {
    await dispatch({
      type: 'SET_REMIXIDE',
      payload: {success: false},
    })
    const {detail, selectedId} = state.workshop

    const workshop = detail[selectedId]

    let path: string
    if (step.solidity.file) {
      path = getFilePath(step.solidity.file)
      path = `.learneth/${workshop.name}/${step.name}/${path}`
      await remixClient.call('fileManager', 'switchFile', `${path}`)
    }

    console.log('testing ', step.test.content)

    path = getFilePath(step.test.file)
    path = `.learneth/${workshop.name}/${step.name}/${path}`
    await remixClient.call('fileManager', 'setFile', path, step.test.content)

    const result = await remixClient.call('solidityUnitTesting', 'testFromPath', path)
    console.log('result ', result)

    if (!result) {
      await dispatch({
        type: 'SET_REMIXIDE',
        payload: {errors: ['Compiler failed to test this file']},
      })
    } else {
      const success = result.totalFailing === 0

      if (success) {
        await dispatch({
          type: 'SET_REMIXIDE',
          payload: {errors: [], success: true},
        })
      } else {
        await dispatch({
          type: 'SET_REMIXIDE',
          payload: {
            errors: result.errors.map((error: {message: any}) => error.message),
          },
        })
      }
    }
  } catch (err) {
    console.log('TESTING ERROR', err)
    await dispatch({
      type: 'SET_REMIXIDE',
      payload: {errors: [String(err)]},
    })
  }
  await dispatch({
    type: 'SET_LOADING',
    payload: {
      screen: false,
    },
  })
}

export const showAnswer = async (step) => {
  await dispatch({
    type: 'SET_LOADING',
    payload: {
      screen: true,
    },
  })

  toast.info('loading answer into IDE')

  try {
    console.log('loading ', step)
    const content = step.answer.content
    let path = getFilePath(step.answer.file)

    const {detail, selectedId} = state.workshop

    const workshop = detail[selectedId]
    path = `.learneth/${workshop.name}/${step.name}/${path}`
    await remixClient.call('fileManager', 'setFile', path, content)
    await remixClient.call('fileManager', 'switchFile', `${path}`)
  } catch (err) {
    await dispatch({
      type: 'SET_REMIXIDE',
      payload: {errors: [String(err)]},
    })
  }

  toast.dismiss()
  await dispatch({
    type: 'SET_LOADING',
    payload: {
      screen: false,
    },
  })
}

export const testSolidityCompiler = async () => {
  try {
    await remixClient.call('solidity', 'getCompilationResult')
  } catch (err) {
    const errors = state.remixide.errors
    await dispatch({
      type: 'SET_REMIXIDE',
      payload: {
        errors: [...errors, "The `Solidity Compiler` is not yet activated.<br>Please activate it using the `SOLIDITY` button in the `Featured Plugins` section of the homepage.<img class='img-thumbnail mt-3' src='assets/activatesolidity.png'>"],
      },
    })
  }
}
