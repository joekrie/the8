import Immutable from "immutable";

export default (state, action) => {
    const { originPlacement, movedAttendeeId } = action.payload;
    const { event } = state;

    if (!originPlacement) {
        return state;
    }

    const [originBoatIndex, originBoat] = 
        event.get("boats").findEntry(boat => boat.get("boatId") === originPlacement.boatId);

    const newBoat = originBoat.deleteIn(["seatAssignments", String(originPlacement.seatPosition)]);

    const newState = Object.create(state);
    newState.event = event.setIn(["boats", originBoatIndex], newBoat);

    return newState;
};