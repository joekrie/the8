import { get } from "lodash";

const loggerMiddleware = store => next => action => {
  if (!window.appInsights) {
    return next(action);
  }
  
  window.appInsights.trackEvent("ReduxAction", { actionType: action.type });

  const event = get(action, "appInsights.event");
  const metric = get(action, "appInsights.metric");

  if (event) {
    const { name, customDimensions, customMeasurements } = event;
    window.appInsights.trackEvent(name, customDimensions);
  }

  if (metric) {
    const { name, value, customDimensions } = metric;
    window.appInsights.trackMetric(name, value, customDimensions);
  }
  
  return next(action);
}

export default loggerMiddleware