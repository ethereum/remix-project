import { toast } from 'react-toastify'
import axios from 'axios'
import groupBy from 'lodash/groupBy'
import pick from 'lodash/pick'
import { plugin, router } from '../App'

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
  await loadRepo(repoMap[code])
}

export const loadRepo = async (payload) => {
  toast.info(`loading ${payload.name}/${payload.branch}`)

  await dispatch({
    type: 'SET_LOADING',
    payload: {
      screen: true,
    },
  })

  const { list, detail } = state.workshop

  const url = `${apiUrl}/clone/${encodeURIComponent(payload.name)}/${payload.branch}?${Math.random()}`

  const { data } = await axios.get(url)
  const repoId = `${payload.name}-${payload.branch}`

  for (let i = 0; i < data.ids.length; i++) {
    const {
      steps,
      metadata: {
        data: { steps: metadataSteps },
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
            step[key].content = '' // (await plugin.call('contentImport', 'resolve', step[key].file)).content
            step[key].isLoaded = false
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
    payload: { ...workshopState },
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
    await router.navigate(`/list?id=${payload.id}`)
  }

}

export const loadStepContent = async (url: string) => {

  const file = await plugin.call('contentImport', 'resolve', url)
  if (file && file.content) {
    return file.content
  }
  return ''
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
    content = await loadStepContent(step.solidity.file)
    path = getFilePath(step.solidity.file)
  }
  if (step.js?.file) {
    content = await loadStepContent(step.js.file)
    path = getFilePath(step.js.file)
  }
  if (step.vy?.file) {
    content = await loadStepContent(step.vy.file)
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

  const { detail, selectedId } = state.workshop

  const workshop = detail[selectedId]

  path = `.learneth/${workshop.name}/${step.name}/${path}`
  try {
    const isExist = await plugin.call('fileManager', 'exists' as any, path)
    if (!isExist) {
      await plugin.call('fileManager', 'setFile', path, content)
    }
    await plugin.call('fileManager', 'switchFile', `${path}`)
    await dispatch({
      type: 'SET_REMIXIDE',
      payload: { errorLoadingFile: false },
    })
    toast.dismiss()
  } catch (error) {
    toast.dismiss()
    toast.error('File could not be loaded. Please try again.')
    await dispatch({
      type: 'SET_REMIXIDE',
      payload: { errorLoadingFile: true },
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
      payload: { success: false },
    })
    const { detail, selectedId } = state.workshop

    const workshop = detail[selectedId]

    let path: string
    if (step.solidity.file) {
      path = getFilePath(step.solidity.file)
      path = `.learneth/${workshop.name}/${step.name}/${path}`
      await plugin.call('fileManager', 'switchFile', `${path}`)
    }
    const content = await loadStepContent(step.test.file)

    path = getFilePath(step.test.file)
    path = `.learneth/${workshop.name}/${step.name}/${path}`
    await plugin.call('fileManager', 'setFile', path, content)

    const result = await plugin.call('solidityUnitTesting', 'testFromPath', path)
    console.log('result ', result)

    if (!result) {
      await dispatch({
        type: 'SET_REMIXIDE',
        payload: { errors: ['Compiler failed to test this file'] },
      })
    } else {
      const success = result.totalFailing === 0

      if (success) {
        await dispatch({
          type: 'SET_REMIXIDE',
          payload: { errors: [], success: true },
        })
      } else {
        await dispatch({
          type: 'SET_REMIXIDE',
          payload: {
            errors: result.errors.map((error: { message: any }) => error.message),
          },
        })
      }
    }
  } catch (err) {
    console.log('TESTING ERROR', err)
    await dispatch({
      type: 'SET_REMIXIDE',
      payload: { errors: [String(err)] },
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

    const content = await loadStepContent(step.answer.file)
    let path = getFilePath(step.answer.file)

    const { detail, selectedId } = state.workshop

    const workshop = detail[selectedId]
    path = `.learneth/${workshop.name}/${step.name}/${path}`
    await plugin.call('fileManager', 'setFile', path, content)
    await plugin.call('fileManager', 'switchFile', `${path}`)
  } catch (err) {
    await dispatch({
      type: 'SET_REMIXIDE',
      payload: { errors: [String(err)] },
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
    await plugin.call('solidity', 'getCompilationResult')
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
