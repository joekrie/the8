import { applyMiddleware as reduxApplyMiddleware, compose } from "redux"

import loggerMiddleware from "./logger-middleware"
import appInsightsMiddleware from "./app-insights-middleware"

export default function applyMiddleware(additionalMiddleware = []) {
  return compose(
    reduxApplyMiddleware.call(null, [
      loggerMiddleware,
      appInsightsMiddleware,
      ...additionalMiddleware
    ]),
    window.devToolsExtension ? window.devToolsExtension() : f => f
  )
}
