import { handleActions } from "redux-actions"

import {
  ADD_ATTENDEE,
  ASSIGN_ATTENDEE,
  MOVE_ATTENDEES_ERROR,
  MOVE_ATTENDEES_REQUEST,
  MOVE_ATTENDEES_SUCCESS,
  UNASSIGN_ATTENDEE
} from "boat-lineup-planner/actions/attendees/action-types"

import { SET_INITIAL_STATE } from "boat-lineup-planner/actions/common/action-types"

import addAttendee from "./add-attendee"
import assignAttendee from "./assign-attendee"
import moveAttendeesError from "./move-attendees-error"
import moveAttendeesRequest from "./move-attendees-request"
import moveAttendeesSuccess from "./move-attendees-success"
import unassignAttendee from "./unassign-attendee"
import setInitialState from "./set-initial-state"

import AttendeesStateRecord from "boat-lineup-planner/models/attendees/attendee-state-record"

const attendeeReducer = handleActions({
  [ADD_ATTENDEE]: addAttendee,
  [ASSIGN_ATTENDEE]: assignAttendee,
  [MOVE_ATTENDEES_ERROR]: moveAttendeesError,
  [MOVE_ATTENDEES_REQUEST]: moveAttendeesRequest,
  [MOVE_ATTENDEES_SUCCESS]: moveAttendeesSuccess,
  [UNASSIGN_ATTENDEE]: unassignAttendee
}, new AttendeesStateRecord())

export default attendeeReducer
