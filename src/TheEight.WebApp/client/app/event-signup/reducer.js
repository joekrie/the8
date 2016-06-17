import { handleActions } from "redux-actions";
import { Map, List } from "immutable";

import { ASSIGN_ATTENDEE, UNASSIGN_ATTENDEE, CHANGE_EVENT_DETAILS, CREATE_BOAT, CREATE_ATTENDEE } from "./actions";
import { defaultState } from "./default-state";
import BoatRecord from "./models/boat-record";

const reducer = handleActions({
  [ASSIGN_ATTENDEE]: (prevState, { type, payload }) => {
    const { attendeeId, boatId, seatNumber } = payload;
    const newBoats = prevState.boats.setIn([boatId, "assignedSeats", seatNumber], attendeeId);

    return {
      ...prevState,
      boats: newBoats
    };
  },
  [UNASSIGN_ATTENDEE]: (prevState, { type, payload }) => {
    const { boatId, seatNumber } = payload;
    const newBoats = prevState.boats.deleteIn([boatId, "assignedSeats", seatNumber]);
    
    return {
      ...prevState,
      boats: newBoats
    };
  },
  [CHANGE_EVENT_DETAILS]: (prevState, { type, payload }) => {
    const { property, newValue } = payload;
     
    if (property === "eventId") {
      return { ...prevState };
    }
    
    const newDetails = prevState.eventDetails.set(property, newValue);
        
    return {
      ...prevState,
      eventDetails: newDetails
    };
  },
  [CREATE_BOAT]: (prevState, { type, payload }) => {
    const { boatDetails } = payload;
    
    const boatId = boatDetails.boatId;
    const newBoats = prevState.boats.set(boatId, new BoatRecord({ details: boatDetails }));
    
    return {
      ...prevState,
      boats: newBoats
    };
  },
  [CREATE_ATTENDEE]:  (prevState, { type, payload }) => {
    const { attendee } = payload;
    
    const newAttendees = prevState.attendees.push(attendee);
    
    return {
      ...prevState,
      attendees: newAttendees
    };
  }
}, defaultState);

export default reducer