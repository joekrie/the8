import { handleActions } from "redux-actions"

import setInitialState from "./set-initial-state"

import AppStatusStateRecord from "boat-lineup-planner/models/app-status/app-status-state-record"

const attendeeReducer = handleActions({
  "SET_INITIAL_STATE": setInitialState
}, new AppStatusStateRecord())

export default attendeeReducer
