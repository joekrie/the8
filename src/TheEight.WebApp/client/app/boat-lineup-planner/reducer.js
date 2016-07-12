import { handleActions } from "redux-actions"
import { Map, List } from "immutable"

import { 
  ASSIGN_ATTENDEE, 
  UNASSIGN_ATTENDEE, 
  CHANGE_EVENT_DETAILS, 
  CREATE_BOAT, 
  CREATE_ATTENDEE,
  REPLACE_STATE
} from "./actions"

import {
  add
}

import defaultState from "boat-lineup-planner/default-state"
import BoatRecord from "boat-lineup-planner/models/boat-record"

const reducer = handleActions({
  [REPLACE_STATE]: (prevState, { type, payload: { newState } }) => newState,
  [ASSIGN_ATTENDEE]: (prevState, { type, payload: { attendeeId, boatId, seatNumber } }) => {
    const newBoats = prevState.boats.setIn([boatId, "assignedSeats", seatNumber], attendeeId)

    return {
      ...prevState,
      boats: newBoats
    }
  },
  [UNASSIGN_ATTENDEE]: (prevState, { type, payload: { boatId, seatNumber } }) => {
    const newBoats = prevState.boats.deleteIn([boatId, "assignedSeats", seatNumber])
    
    return {
      ...prevState,
      boats: newBoats
    }
  },
  [CHANGE_EVENT_DETAILS]: (prevState, { type, payload: { property, newValue } }) => {     
    if (property === "eventId") {
      return { ...prevState }
    }
    
    const newDetails = prevState.eventDetails.set(property, newValue)
        
    return {
      ...prevState,
      eventDetails: newDetails
    }
  },
  [CREATE_BOAT]: (prevState, { type, payload: { boatDetails } }) => {
    const boatId = boatDetails.boatId
    const newBoats = prevState.boats.set(boatId, new BoatRecord({ details: boatDetails }))
    
    return {
      ...prevState,
      boats: newBoats
    }
  },
  [CREATE_ATTENDEE]:  (prevState, { type, payload: { attendee } }) => {
    const newAttendees = prevState.attendees.push(attendee)
    
    return {
      ...prevState,
      attendees: newAttendees
    }
  }
}, defaultState)

export default reducer