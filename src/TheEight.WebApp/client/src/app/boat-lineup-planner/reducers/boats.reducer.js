import { handleActions } from "redux-actions"

import BoatsStateRecord from "../records/boats-state.record"

const attendeeReducer = handleActions({
  "ADD_BOAT": addBoat,
  "SET_INIITIAL_STATE": setInitialState
}, new BoatsStateRecord())

export default attendeeReducer
