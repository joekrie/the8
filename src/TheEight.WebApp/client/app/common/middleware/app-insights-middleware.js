import { get } from "lodash";
import {AppInsights} from "applicationinsights-js"

const loggerMiddleware = store => next => action => {  
  try {
    AppInsights.trackEvent("ReduxAction", { actionType: action.type });

    const event = get(action, "appInsights.event");
    const metric = get(action, "appInsights.metric");

    if (event) {
      const { name, customDimensions, customMeasurements } = event;
      AppInsights.trackEvent(name, customDimensions);
    }

    if (metric) {
      const { name, value, customDimensions } = metric;
      AppInsights.trackMetric(name, value, customDimensions);
    }
  }
  catch (err) {
    console.log("failed to send data to app insights")
  }
  finally {
    return next(action);
  }
}

export default loggerMiddleware