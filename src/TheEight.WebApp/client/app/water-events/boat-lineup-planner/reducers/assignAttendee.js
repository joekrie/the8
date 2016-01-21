export default (state, action) => {
    const { newPlacement, attendeeId } = action.payload;

    const boatAndPos = state.event
        .get("boats")
        .findEntry(boat => boat.get("boatId") === newPlacement.boatId);

    const newBoat = boatAndPos[1]
        .setIn(["seatAssignments", String(newPlacement.seatPosition)], attendeeId);

    const newState = Object.create(state);

    newState.event = state.event
        .setIn(["boats", boatAndPos[0]], newBoat);

    return newState;
};