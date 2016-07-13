import { MOVE_ATTENDEES_REQUEST } from "boat-lineup-planner/actions"

const moveAttendeesRequest = createAction(
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

export default moveAttendeesRequest
