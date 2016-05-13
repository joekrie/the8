import { createAction } from "redux-actions";

import { ASSIGN_ATTENDEE_TO_SEAT, UNASSIGN_ATTENDEE_IN_SEAT } from "./actions";

const assignAttendeeToSeat = createAction(ASSIGN_ATTENDEE_TO_SEAT);
const unassignAttendeeInSeat = createAction(UNASSIGN_ATTENDEE_IN_SEAT);

export { assignAttendeeToSeat, unassignAttendeeInSeat }