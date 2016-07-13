import { 
  SET_INITIAL_STATE,
  SAVE_EVENT_DETAILS_SUCCESS,
  SAVE_EVENT_DETAILS_ERROR
} from "../actions"

export const saveEventDetailsSuccess = createAction(SAVE_EVENT_DETAILS_SUCCESS)
export const saveEventDetailsError = createAction(SAVE_EVENT_DETAILS_ERROR)
export const setInitialState = createAction(SET_INITIAL_STATE)
