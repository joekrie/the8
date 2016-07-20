import { handleActions } from "redux-actions"

import defaultState from "./default-state"

const attendeeReducer = handleActions({
  "SAVE_EVENT_DETAILS_ERROR": saveEventDetailsError,
  "SAVE_EVENT_DETAILS_REQUEST": saveEventDetailsRequest,
  "SAVE_EVENT_DETAILS_SUCCESS": saveEventDetailsSuccess
}, defaultState)

export default attendeeReducer
