import { handleActions } from "redux-actions"

import setInitialState from "./set-initial-state"
import addBoat from "./add-boat"

import BoatsStateRecord from "boat-lineup-planner/models/boats/boats-state-record"

const attendeeReducer = handleActions({
  "ADD_BOAT": addBoat,
  "SET_INIITIAL_STATE": setInitialState
}, new BoatsStateRecord())

export default attendeeReducer
