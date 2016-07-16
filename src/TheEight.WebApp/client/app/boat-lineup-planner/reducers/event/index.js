import { handleActions } from "redux-actions"

import {
  SAVE_EVENT_DETAILS_ERROR,
  SAVE_EVENT_DETAILS_REQUEST,
  SAVE_EVENT_DETAILS_SUCCESS
} from "./actions"

import saveEventDetailsError from "./reducer-functions/save-event-details-error"
import saveEventDetailsRequest from "./reducer-functions/save-event-details-request"
import saveEventDetailsSuccess from "./reducer-functions/save-event-details-success"

import defaultState from "./default-state"

const attendeeReducer = handleActions({
  [SAVE_EVENT_DETAILS_ERROR]: saveEventDetailsError,
  [SAVE_EVENT_DETAILS_REQUEST]: saveEventDetailsRequest,
  [SAVE_EVENT_DETAILS_SUCCESS]: saveEventDetailsSuccess
}, defaultState)

export default attendeeReducer
