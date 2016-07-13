import { combineReducers } from "redux"

import attendeeReducer from "./attendee-reducer"
import boatReducer from "./boat-reducer"
import eventReducer from "./event-reducer"

const reducer = combineReducers({
  attendees: attendeeReducer,
  boats: boatReducer,
  event: eventReducer
})

export default reducer
