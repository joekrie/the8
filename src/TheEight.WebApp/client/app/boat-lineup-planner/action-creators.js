import { createAction } from "redux-actions";

import {
  ASSIGN_ATTENDEE, 
  UNASSIGN_ATTENDEE, 
  CHANGE_EVENT_DETAILS, 
  CREATE_BOAT, 
  CREATE_ATTENDEE,
  DELETE_ATTENDEE,
  DELETE_BOAT
} from "./actions";

export const assignAttendee = createAction(ASSIGN_ATTENDEE, (attendeeId, boatId, seatNumber) => ({ attendeeId, boatId, seatNumber }));
export const unassignAttendee = createAction(UNASSIGN_ATTENDEE, (boatId, seatNumber) => ({ boatId, seatNumber }));
export const changeEventDetails = createAction(CHANGE_EVENT_DETAILS, (property, newValue) => ({ property, newValue }));
export const createBoat = createAction(CREATE_BOAT, boatDetails => ({ boatDetails }));
export const createAttendee = createAction(CREATE_ATTENDEE, attendee => ({ attendee }));