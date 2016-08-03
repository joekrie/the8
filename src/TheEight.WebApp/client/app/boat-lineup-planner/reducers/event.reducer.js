import { handleActions } from "redux-actions"

import EventStateRecord from "boat-lineup-planner/models/event/event-state-record"

const attendeeReducer = handleActions({
  //"SAVE_EVENT_DETAILS_ERROR": saveEventDetailsError,
  //"SAVE_EVENT_DETAILS_REQUEST": saveEventDetailsRequest,
  //"SAVE_EVENT_DETAILS_SUCCESS": saveEventDetailsSuccess
}, new EventStateRecord())

export default attendeeReducer
