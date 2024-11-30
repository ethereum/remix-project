import { configureStore, createSlice, type PayloadAction, type Reducer } from '@reduxjs/toolkit'
import createSagaMiddleware from 'redux-saga'
import { call, put, takeEvery, delay, select, all, fork, type ForkEffect } from 'redux-saga/effects'

// @ts-expect-error
const context = require.context('./models', false, /\.ts$/)
const models = context.keys().map((key: any) => context(key).default)

export type StateType = Record<string, any>
export interface ModelType {
  namespace: string
  state: StateType
  reducers: Record<string, (state: StateType, action: PayloadAction<any>) => StateType>
  effects: Record<
    string,
    (
      action: PayloadAction<any>,
      effects: {
        call: typeof call
        put: typeof put
        delay: typeof delay
        select: typeof select
      }
    ) => Generator<any, void, any>
  >
}

function createReducer(model: ModelType): Reducer {
  const reducers = model.reducers
  Object.keys(model.effects).forEach((key) => {
    reducers[key] = (state: StateType, action: PayloadAction<any>) => state
  })
  const slice = createSlice({
    name: model.namespace,
    initialState: model.state,
    reducers,
  })
  return slice.reducer
}

const rootReducer = models.reduce((prev: any, model: ModelType) => {
  return { ...prev, [model.namespace]: createReducer(model) }
}, {})

function watchEffects(model: ModelType): ForkEffect {
  return fork(function* () {
    for (const key in model.effects) {
      const effect = model.effects[key]
      yield takeEvery(`${model.namespace}/${key}`, function* ({ callback, ...action }: {type: string; payload: any; callback?: any}) {
        yield put({
          type: 'loading/save',
          payload: {
            [`${model.namespace}/${key}`]: true,
          },
        })
        const result = yield effect(action, {
          call,
          put,
          delay,
          select,
        })
        callback && callback(result)
        yield put({
          type: 'loading/save',
          payload: {
            [`${model.namespace}/${key}`]: false,
          },
        })
      })
    }
  })
}

function* rootSaga(): Generator {
  yield all(models.map((model: ModelType) => watchEffects(model)))
}

const configureAppStore = (initialState = {}) => {
  const reduxSagaMonitorOptions = {}
  const sagaMiddleware = createSagaMiddleware(reduxSagaMonitorOptions)

  const middleware = [sagaMiddleware]

  const store = configureStore({
    reducer: rootReducer,
    middleware: (gDM) =>
      gDM({
        serializableCheck: {
          // Ignore these field paths in all actions
          ignoredActionPaths: ['callback'],
        },
      }).concat([...middleware]),
    preloadedState: initialState,
    devTools: process.env.NODE_ENV !== 'production',
  })

  sagaMiddleware.run(rootSaga)
  return store
}

export const store = configureAppStore()

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
