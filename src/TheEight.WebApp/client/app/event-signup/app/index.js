import { List, Map, fromJS } from "immutable"
import { Component } from "react"
import { Provider } from "react-redux"
import { createStore, applyMiddleware } from "redux"

import loggerMiddleware from "../../common/middleware/logger-middleware"
import appInsightsMiddleware from "../../common/middleware/app-insights-middleware"
import reducer from "../reducer"
import sampleState from "./sample-state"
import EventList from "../containers/event-list"

import "./styles.scss"

const store = createStore(
  reducer,
  { ...sampleState },
  applyMiddleware(
    loggerMiddleware,
    appInsightsMiddleware
  )
);

export default class EventSignupApp extends Component {
  render() {
    return (
      <Provider store={store}>
        <div className="container-fluid event-signup">
          <EventList />
        </div>
      </Provider>
    );
  }
}