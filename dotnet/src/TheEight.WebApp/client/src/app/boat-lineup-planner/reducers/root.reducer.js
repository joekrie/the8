import { combineReducers } from "redux"
import { handleActions } from "redux-actions"

import attendeesReducer from "./attendees.reducer"
import boatsReducer from "./boats.reducer"
import eventReducer from "./event.reducer"
import appStatusReducer from "./app-status.reducer"

const rootReducer = combineReducers({
  attendees: attendeesReducer,
  boats: boatsReducer,
  event: eventReducer,
  appStatus: appStatusReducer
})

export default rootReducer
