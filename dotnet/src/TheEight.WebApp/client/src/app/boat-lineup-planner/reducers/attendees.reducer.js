import { handleActions } from "redux-actions"

import AttendeesStateRecord from "../records/attendees-state.record"

const attendeesReducer = handleActions({

}, new AttendeesStateRecord())

export default attendeesReducer
