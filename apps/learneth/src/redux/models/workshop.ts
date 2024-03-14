import axios from 'axios'
import {toast} from 'react-toastify'
import groupBy from 'lodash/groupBy'
import pick from 'lodash/pick'
import {type ModelType} from '../store'
import remixClient from '../../remix-client'
import {router} from '../../App'

// const apiUrl = 'http://localhost:3001';
const apiUrl = 'https://static.220.14.12.49.clients.your-server.de:3000'

const Model: ModelType = {
  namespace: 'workshop',
  state: {
    list: [],
    detail: {},
    selectedId: '',
  },
  reducers: {
    save(state, {payload}) {
      return {...state, ...payload}
    },
  },
  effects: {
    *init(_, {put}) {
      const cache = localStorage.getItem('workshop.state')

      if (cache) {
        const workshopState = JSON.parse(cache)
        yield put({
          type: 'workshop/save',
          payload: workshopState,
        })
      } else {
        yield put({
          type: 'workshop/loadRepo',
          payload: {
            name: 'ethereum/remix-workshops',
            branch: 'master',
          },
        })
      }
    },
    *loadRepo({payload}, {put, select}) {
      toast.info(`loading ${payload.name}/${payload.branch}`)

      yield put({
        type: 'loading/save',
        payload: {
          screen: true,
        },
      })

      const {list, detail} = yield select((state) => state.workshop)

      const url = `${apiUrl}/clone/${encodeURIComponent(payload.name)}/${payload.branch}?${Math.random()}`
      console.log('loading ', url)
      const {data} = yield axios.get(url)
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
                step[key].content = (yield remixClient.call('contentImport', 'resolve', step[key].file)).content
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
      yield put({
        type: 'workshop/save',
        payload: workshopState,
      })
      localStorage.setItem('workshop.state', JSON.stringify(workshopState))

      toast.dismiss()
      yield put({
        type: 'loading/save',
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
            yield router.navigate(`/list?id=${ids[i]}`)
            break
          }
        }
      }
    },
    *resetAll(_, {put}) {
      yield put({
        type: 'workshop/save',
        payload: {
          list: [],
          detail: {},
          selectedId: '',
        },
      })

      localStorage.removeItem('workshop.state')

      yield put({
        type: 'workshop/init',
      })
    },
  },
}

export default Model
