import { handleActions } from "redux-actions"

import {
  ADD_ATTENDEE,
  ASSIGN_ATTENDEE,
  MOVE_ATTENDEES_ERROR,
  MOVE_ATTENDEES_REQUEST,
  MOVE_ATTENDEES_SUCCESS,
  UNASSIGN_ATTENDEE
} from "./actions"

import addAttendee from "./reducer-functions/add-attendee"
import assignAttendee from "./reducer-functions/assign-attendee"
import moveAttendeesError from "./reducer-functions/move-attendees-error"
import moveAttendeesRequest from "./reducer-functions/move-attendees-request"
import moveAttendeesSuccess from "./reducer-functions/move-attendees-success"
import unassignAttendee from "./reducer-functions/unassign-attendee"

import defaultState from "./default-state"

const attendeeReducer = handleActions({
  [ADD_ATTENDEE]: addAttendee,
  [ASSIGN_ATTENDEE]: assignAttendee,
  [MOVE_ATTENDEES_ERROR]: moveAttendeesError,
  [MOVE_ATTENDEES_REQUEST]: moveAttendeesRequest,
  [MOVE_ATTENDEES_SUCCESS]: moveAttendeesSuccess,
  [UNASSIGN_ATTENDEE]: unassignAttendee
}, defaultState)

export default attendeeReducer
