import { handleActions } from "redux-actions"

import {
  ADD_BOAT
} from "./actions"

import { SET_INITIAL_STATE } from "boat-lineup-planner/actions/root/actions"

import addBoat from "./reducer-functions/add-boat"

import defaultState from "./default-state"

const attendeeReducer = handleActions({
  [ADD_BOAT]: addBoat,
  [SET_INIITIAL_STATE]: (prevState, action) => action.payload.boats
}, defaultState)

export default attendeeReducer
