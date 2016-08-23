import { handleActions } from "redux-actions"
import { Map } from "immutable"

import StatusStateRecord from "../records/status-state.record"

export function doneLoading(state, action) {
  return state.set("isLoaded", true)
}

export function loadingErrored(state) {
  return state.set("loadingErrorMessage", action.payload)
}

const statusReducer = handleActions({
  DONE_LOADING: doneLoading,
  LOADING_ERRORED: loadingErrored
}, new StatusStateRecord())

export default statusReducer
