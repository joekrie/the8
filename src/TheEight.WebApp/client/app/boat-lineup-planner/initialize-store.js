import { Iterable } from "immutable"
import { applyMiddleware, compose, createStore } from "redux"
import createLogger from "redux-logger"
import createSagaMiddleware from "redux-saga"

import appInsightsMiddleware from "common/middleware/app-insights-middleware"

import rootReducer from "./reducers/root.reducer"
import rootSaga from "./sagas/root.saga"

import sampleState from "./sample-state"

function initializeStore(defaultState, rootReducer, rootSaga, additionalMiddleware = []) {
  const sagaMiddleware = createSagaMiddleware()
  
  const loggerMiddleware = createLogger({
    stateTransformer: state => {
      let newState = {}

      for (let key of Object.keys(state)) {
        newState[key] = 
          Iterable.isIterable(state[key])
            ? state[key].toJS()
            : state[key]
      }

      return newState
    }
  })

  const storeEnhancer = compose(
    applyMiddleware.apply(null, [      
      appInsightsMiddleware,
      ...additionalMiddleware,
      loggerMiddleware,
      sagaMiddleware
    ]),
    window.devToolsExtension 
      ? window.devToolsExtension() 
      : store => store
  )
    
  const store = createStore(
    rootReducer,
    { ...defaultState },
    storeEnhancer
  )
  
  sagaMiddleware.run(rootSaga)
  return store
}

export default function initStore() {
  return initializeStore(sampleState, rootReducer, rootSaga)
}
