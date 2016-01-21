import Immutable from "immutable";

export default (state, action) => {
    console.log(action);

    //const { seatPosition, attendeeId, boatId } = action.payload;

    //const boatAndPos = state.event
    //    .get("boats")
    //    .findEntry(boat => boat.get("boatId") === boatId);

    //const newBoat = boatAndPos[1]
    //    .setIn(["seatAssignments", String(seatPosition)], attendeeId);

    //const newState = Object.create(state);

    //newState.event = state.event
    //    .setIn(["boats", boatAndPos[0]], newBoat);

    //return newState;

    return state;
};