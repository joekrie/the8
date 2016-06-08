import { handleActions } from "redux-actions";
import { Map, List } from "immutable";

import { SIGNUP, UN_SIGNUP } from "./actions";
import { defaultState } from "./default-state";

const reducer = handleActions({
  [SIGNUP]: (prevState, { type, payload }) => {
    const { attendeeId, boatId, seatNumber } = payload;
    const newBoats = prevState.boats.setIn([boatId, "assignedSeats", seatNumber], attendeeId);

    return {
      ...prevState,
      boats: newBoats
    };
  },
  [UN_SIGNUP]: (prevState, { type, payload }) => {
    const { boatId, seatNumber } = payload;
    const newBoats = prevState.boats.deleteIn([boatId, "assignedSeats", seatNumber]);
    
    return {
      ...prevState,
      boats: newBoats
    };
  }
}, defaultState);

export default reducer