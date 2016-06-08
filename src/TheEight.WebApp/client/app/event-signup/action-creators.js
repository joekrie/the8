import { createAction } from "redux-actions";

import { ATTEND, UNATTEND } from "./actions";

export const attend = createAction(ATTEND, (attendeeId, eventId) => ({ attendeeId, eventId }));
export const unattend = createAction(UNATTEND, (attendeeId, eventId) => ({ attendeeId, eventId }));