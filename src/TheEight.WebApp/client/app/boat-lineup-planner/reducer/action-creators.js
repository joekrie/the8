import { createAction } from "redux-actions"

import {
  ASSIGN_ATTENDEE, 
  UNASSIGN_ATTENDEE, 
  CHANGE_EVENT_DETAILS, 
  CREATE_BOAT, 
  CREATE_ATTENDEE,
  DELETE_ATTENDEE,
  DELETE_BOAT,
  REPLACE_STATE
} from "./actions"

export const assignAttendee = createAction(ASSIGN_ATTENDEE, (attendeeId, boatId, seatNumber) => ({ attendeeId, boatId, seatNumber }))
export const unassignAttendee = createAction(UNASSIGN_ATTENDEE, (boatId, seatNumber) => ({ boatId, seatNumber }))
export const changeEventDetails = createAction(CHANGE_EVENT_DETAILS, (property, newValue) => ({ property, newValue }))
export const createBoat = createAction(CREATE_BOAT, boatDetails => ({ boatDetails }))
export const createAttendee = createAction(CREATE_ATTENDEE, attendee => ({ attendee }))
export const replaceState = createAction(REPLACE_STATE, newState => ({ newState }))

export const moveAttendees = createAction("MOVE_ATTENDEES_REQUEST", 
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

    fetch("/url", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "same-origin",
      body: JSON.stringify(postBody)
    }).then(() => {
      actions.forEach(dispatch)
    })
  })

export const saveEventDetails = createAction("SAVE_EVENT_DETAILS", 
  formData => dispatch => {
    fetch("/url", {
      method: "POST",
      credentials: "same-origin",
      body: formData
    }).then(() => {
      const action = replaceState()
      dispatch(action)
    })
  })
