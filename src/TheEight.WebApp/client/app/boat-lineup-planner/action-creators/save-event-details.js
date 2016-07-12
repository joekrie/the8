import { 
  SAVE_EVENT_DETAILS_REQUEST,
  SAVE_EVENT_DETAILS_SUCCESS,
  SAVE_EVENT_DETAILS_ERROR
} from "../actions"

export const saveEventDetailsSuccess = createAction(SAVE_EVENT_DETAILS_SUCCESS)
export const saveEventDetailsError = createAction(SAVE_EVENT_DETAILS_ERROR)

export const saveEventDetailsRequest = createAction(
  SAVE_EVENT_DETAILS_REQUEST,
  formData => dispatch => {
    fetch("/save-event-details-success", {
      method: "POST",
      credentials: "same-origin",
      body: formData
    }).then(() => {
      dispatch(saveEventDetailsSuccess())
    }).catch(err => {
      dispatch(saveEventDetailsError(err))
    })
  }
)
