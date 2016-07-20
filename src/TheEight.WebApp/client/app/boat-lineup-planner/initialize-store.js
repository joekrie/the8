import { createStore, applyMiddleware, compose } from "redux"
import createLogger from "redux-logger"

import appInsightsMiddleware from "common/middleware/app-insights-middleware"
import rootReducer from "boat-lineup-planner/reducers/root-reducer"

export default function initializeState() {
  const sagaMiddleware = createSagaMiddleware()
  const loggerMiddleware = createLogger()

  const store = createStore(
    rootReducer,
    { ...defaultState },
    compose(
      applyMiddleware(
        loggerMiddleware,
        appInsightsMiddleware,
        sagaMiddleware
      ),
      window.devToolsExtension ? window.devToolsExtension() : f => f
    )
  )

  sagaMiddleware.run(mySaga)
  
  return store
}
