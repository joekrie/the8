import { createAction } from "redux-actions";

import {
  REGISTER,
  UNREGISTER
} from "./actions";

export const register = createAction(REGISTER, eventId => ({ eventId }));
export const unregister = createAction(UNREGISTER, eventId => ({ eventId }));