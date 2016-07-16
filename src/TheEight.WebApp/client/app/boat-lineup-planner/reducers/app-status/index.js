import { handleActions } from "redux-actions"

import { SET_INITIAL_STATE } from "boat-lineup-planner/actions/common/action-types"

import setInitialState from "./set-initial-state"

import AppStatusStateRecord from "boat-lineup-planner/models/app-status/app-status-state-record"

const attendeeReducer = handleActions({
  [SET_INITIAL_STATE]: setInitialState
}, defaultState)

export default attendeeReducer
