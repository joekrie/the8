import { handleActions } from "redux-actions"

import {
  ADD_BOAT
} from "./actions"

import addBoat from "./reducer-functions/add-boat"

import defaultState from "./default-state"

const attendeeReducer = handleActions({
  [ADD_BOAT]: addBoat
}, defaultState)

export default attendeeReducer
