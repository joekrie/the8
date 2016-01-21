export default (state, action) => {
    console.log("move");

    const { oldPlacement, newPlacement, attendeeId  } = action.payload;
    
    const newBoatAndPos = state.event
        .get("boats")
        .findEntry(boat => boat.get("boatId") === newPlacement.boatId);
    
    const newBoat = newBoatAndPos[1]
        .setIn(["seatAssignments", String(newPlacement.seatPosition)], attendeeId);

    const newState = Object.create(state);

    newState.event = state.event
        .setIn(["boats", newBoatAndPos[0]], newBoat);

    return newState;
};