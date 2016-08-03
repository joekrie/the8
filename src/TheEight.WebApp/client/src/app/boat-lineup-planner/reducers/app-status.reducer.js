import { handleActions } from "redux-actions"

import AppStatusStateRecord from "boat-lineup-planner/records/app-status-state.record"

const attendeeReducer = handleActions({
  "SET_INITIAL_STATE": (prevState, action) => {
    return prevState.set("isInitialDataLoaded", true)
  }
}, new AppStatusStateRecord())

export default attendeeReducer
