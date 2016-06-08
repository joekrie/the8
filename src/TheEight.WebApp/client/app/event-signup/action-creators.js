import { createAction } from "redux-actions";

import { SIGNUP, UN_SIGNUP } from "./actions";

export const signup = createAction(SIGNUP, (attendeeId, eventId) => ({ attendeeId, eventId }));
export const unSignup = createAction(UN_SIGNUP, (attendeeId, eventId) => ({ attendeeId, eventId }));