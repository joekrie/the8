import { 
  MOVE_ATTENDEES_REQUEST, 
  MOVE_ATTENDEES_SUCCESS,
  MOVE_ATTENDEES_ERROR,
  ASSIGN_ATTENDEE, 
  UNASSIGN_ATTENDEE 
} from "boat-lineup-planner/actions"

export const moveAttendeesSuccess = createAction(MOVE_ATTENDEES_SUCCESS)
export const moveAttendeesError = createAction(MOVE_ATTENDEES_ERROR)

export const moveAttendeesRequest = createAction(
  MOVE_ATTENDEES_REQUEST, 
  actions => dispatch => {
    const postBody = {
      assignments: [],
      unassignments: []
    }

    actions.forEach(action => {
      if (action.type === ASSIGN_ATTENDEE) {
        postBody.assignments.push(action.payload)
      }

      if (action.type === UNASSIGN_ATTENDEE) {
        postBody.unassignments.push(action.payload)
      }
    })

    fetch("/move-attendees", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "same-origin",
      body: JSON.stringify(postBody)
    }).then(() => {
      actions.forEach(dispatch)
      dispatch(moveAttendeesSuccess())
    }).catch(err => {
      dispatch(moveAttendeesError(err))
    })
  }
)
