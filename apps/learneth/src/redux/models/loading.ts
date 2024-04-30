import { type ModelType } from '../store'

const Model: ModelType = {
  namespace: 'loading',
  state: { screen: true },
  reducers: {
    save(state, { payload }) {
      return { ...state, ...payload }
    },
  },
  effects: {},
}

export default Model
