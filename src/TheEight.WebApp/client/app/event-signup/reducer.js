import { handleActions } from "redux-actions";
import { Map, List } from "immutable";

import { defaultState } from "./default-state";

import { 
  ATTEND, 
  UNATTEND 
} from "./actions";

const reducer = handleActions({
  [ATTEND]: (prevState, { type, payload }) => {
    const { 
      attendeeId, 
      boatId, 
      seatNumber 
    } = payload;

    const newBoats = prevState.boats.setIn([boatId, "assignedSeats", seatNumber], attendeeId);

    return {
      ...prevState,
      boats: newBoats
    };
  },
  [UNATTEND]: (prevState, { type, payload }) => {
    const { boatId, seatNumber } = payload;
    const newBoats = prevState.boats.deleteIn([boatId, "assignedSeats", seatNumber]);
    
    return {
      ...prevState,
      boats: newBoats
    };
  }
}, defaultState);

export default reducer