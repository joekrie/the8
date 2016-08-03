
const saveEventDetailsRequest = createAction(
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