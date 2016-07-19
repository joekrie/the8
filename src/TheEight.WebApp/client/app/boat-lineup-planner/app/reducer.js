import { combineReducers } from "redux"
import { handleActions } from "redux-actions"

import attendeesReducer from "./attendees/reducer"
import boatsReducer from "./boats/reducer"
import eventsReducer from "./event/reducer"
import appStatusReducer from "./app-status/reducer"

const reducer = combineReducers({
  attendees: attendeeReducer,
  boats: boatReducer,
  event: eventReducer,
  appStatus: appStatusReducer
})

export default reducer
