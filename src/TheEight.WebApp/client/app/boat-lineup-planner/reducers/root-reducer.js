import { combineReducers } from "redux"
import { handleActions } from "redux-actions"

import attendeesReducer from "boat-lineup-planner/reducers/attendees"
import boatsReducer from "boat-lineup-planner/reducers/boats"
import eventsReducer from "boat-lineup-planner/reducers/event"
import appStatusReducer from "boat-lineup-planner/reducers/app-status"

const rootReducer = combineReducers({
  attendees: attendeeReducer,
  boats: boatReducer,
  event: eventReducer,
  appStatus: appStatusReducer
})

export default rootReducer
