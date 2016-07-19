import { createStore, applyMiddleware, compose } from "redux"
import loggerMiddleware from "common/middleware/logger-middleware"
import appInsightsMiddleware from "common/middleware/app-insights-middleware"
import reducer from "./reducer"

export default function initializeState() {
  const sagaMiddleware = createSagaMiddleware()

  const store = createStore(
    reducer,
    { ...defaultState },
    compose(
      applyMiddleware(
        thunk,
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
