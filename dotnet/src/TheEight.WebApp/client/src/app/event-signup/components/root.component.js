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
const sampleState = {
  settings: new SettingsRecord({
    showRegisteredAttendees: true
  }),
  attendee: new AttendeeRecord({
    attendeeId: "rower-1",
    sortName: "Sheen, Martin",
    displayName: "Martin Sheen",
    position: PORT_ROWER
  }),
  events: Map({
    "event-1": new EventListItemRecord({
      event: new EventRecord({
        eventId: "event-1",
        date: LocalDate.of(2016, 7, 30),
        notes: "",
        type: WATER_EVENT
      }),
      otherAttendees: List([
        new AttendeeRecord({
          attendeeId: "cox-1",
          sortName: "Hill, Dule",
          displayName: "Dule Hill",
          position: COXSWAIN
        })
      ]),
      isRegistered: true
    }),
    "event-2": new EventListItemRecord({
      event: new EventRecord({
        eventId: "event-2",
        date: LocalDate.of(2016, 8, 1),
        notes: "",
        type: ERG_EVENT
      }),
      otherAttendees: List([
        new AttendeeRecord({
          attendeeId: "rower-3",
          sortName: "Schiff, Richard",
          displayName: "Richard Schiff",
          position: BISWEPTUAL_ROWER
        }),
        new AttendeeRecord({
          attendeeId: "rower-4",
          sortName: "Janney, Allison",
          displayName: "Allison Janney",
          position: STARBOARD_ROWER
        })
      ]),
      isRegistered: false
    })
  })
}

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