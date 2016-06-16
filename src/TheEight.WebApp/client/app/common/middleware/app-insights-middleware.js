import { get } from "lodash";

const loggerMiddleware = store => next => action => {  
  try {
    appInsights.trackEvent("ReduxAction", { actionType: action.type });

    const event = get(action, "appInsights.event");
    const metric = get(action, "appInsights.metric");

    if (event) {
      const { name, customDimensions, customMeasurements } = event;
      appInsights.trackEvent(name, customDimensions);
    }

    if (metric) {
      const { name, value, customDimensions } = metric;
      appInsights.trackMetric(name, value, customDimensions);
    }
  }
  finally {
    return next(action);
  }
}

export default loggerMiddleware