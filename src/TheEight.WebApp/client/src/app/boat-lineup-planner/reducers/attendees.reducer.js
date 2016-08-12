import { handleActions } from "redux-actions"

import AttendeesStateRecord from "../records/attendees-state.record"

const attendeeReducer = handleActions({
  "SET_INITIAL_STATE": setInitialState,
  "ADD_ATTENDEE": addAttendee,
  "ASSIGN_ATTENDEE": assignAttendee,
  "MOVE_ATTENDEES_ERROR": moveAttendeesError,
  "MOVE_ATTENDEES_REQUEST": moveAttendeesRequest,
  "MOVE_ATTENDEES_SUCCESS": moveAttendeesSuccess,
  "UNASSIGN_ATTENDEE": unassignAttendee
}, new AttendeesStateRecord())

export default attendeeReducer
