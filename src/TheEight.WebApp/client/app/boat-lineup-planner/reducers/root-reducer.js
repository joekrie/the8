import { combineReducers } from "redux"
import { handleActions } from "redux-actions"

import attendeesReducer from "boat-lineup-planner/reducers/attendees"
import boatsReducer from "boat-lineup-planner/reducers/boats"
import eventReducer from "boat-lineup-planner/reducers/event"
import appStatusReducer from "boat-lineup-planner/reducers/app-status"

const rootReducer = combineReducers({
  attendees: attendeesReducer,
  boats: boatsReducer,
  event: eventReducer,
  appStatus: appStatusReducer
})

export default rootReducer
