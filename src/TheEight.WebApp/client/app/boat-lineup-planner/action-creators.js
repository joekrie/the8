import { createAction } from "redux-actions";

import { ASSIGN_ATTENDEE, UNASSIGN_ATTENDEE } from "./actions";

const assignAttendee = createAction(ASSIGN_ATTENDEE, 
  (attendeeId, boatId, seatNumber) => ({ attendeeId, boatId, seatNumber }));

const unassignAttendee = createAction(UNASSIGN_ATTENDEE, (boatId, seatNumber) => { boatId, seatNumber });

export { assignAttendee, unassignAttendee }