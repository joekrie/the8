import { createAction } from "redux-actions";

import {
  SIGN_UP 
} from "./actions";

export const signUp = createAction(SIGN_UP, (eventId, attendeeId) => ({ eventId, attendeeId }));