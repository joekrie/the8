import { createAction } from "redux-actions";

import { ASSIGN_ATTENDEE, UNASSIGN_ATTENDEE } from "./actions";

const assignAttendee = createAction(ASSIGN_ATTENDEE, 
  (attendeeId, seatDetails) => ({ attendeeId, seatDetails }));

const unassignAttendee = createAction(UNASSIGN_ATTENDEE);

export { assignAttendee, unassignAttendee }