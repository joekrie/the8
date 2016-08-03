import { handleActions } from "redux-actions"
import { Map, List } from "immutable"

import { defaultState } from "./default-state"

import {
  REGISTER,
  UNREGISTER
} from "./actions"

const reducer = handleActions({
  [REGISTER]: (prevState, { type, payload }) => {
    const { eventId } = payload
    const newEvents = prevState.events.setIn([eventId, "isRegistered"], true)

    return {
      ...prevState,
      events: newEvents
    }
  },
  [UNREGISTER]: (prevState, { type, payload }) => {
    const { eventId } = payload
    const newEvents = prevState.events.setIn([eventId, "isRegistered"], false)

    return {
      ...prevState,
      events: newEvents
    }
  }
}, defaultState)

export default reducer