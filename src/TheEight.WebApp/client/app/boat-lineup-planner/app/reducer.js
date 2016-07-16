import { combineReducers } from "redux"
import { handleActions } from "redux-actions"

import attendeesReducer from "./attendees/reducer"
import boatsReducer from "./boats/reducer"
import eventsReducer from "./event/reducer"
import appStatusReducer from "./app-status/reducer"

import {
  SET_INITIAL_STATE
} from "./actions"

const reducer = combineReducers({
  attendees: attendeeReducer,
  boats: boatReducer,
  event: eventReducer,
  appStatus: 
  isStateLoaded: handleActions({
    [SET_INITIAL_STATE]: (prevState, action) => true
  })
})

export default reducer
