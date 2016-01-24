export default (state, action) => {
    const { targetPlacement, movedAttendeeId, originPlacement, targetAttendeeId } = action.payload;
    const { event } = state;

    const [targetBoatIndex, targetBoat] = 
        event.get("boats")
            .findEntry(boat => boat.get("boatId") === targetPlacement.boatId);

    let newTargetBoat = targetBoat.setIn(["seatAssignments", targetPlacement.seatPosition], movedAttendeeId);
    let newEvent = event.setIn(["boats", targetBoatIndex], newTargetBoat);
    let movingWithinBoat = false;

    if (originPlacement) {
        const [originBoatIndex, originBoat] = 
            event.get("boats").findEntry(boat => boat.get("boatId") === originPlacement.boatId);
               
        if (targetAttendeeId) {
            if (originBoatIndex === targetBoatIndex) {
                newTargetBoat = newTargetBoat.setIn(["seatAssignments", originPlacement.seatPosition], targetAttendeeId);
                movingWithinBoat = true;
            } else {
                const newOriginBoat = originBoat.setIn(["seatAssignments", originPlacement.seatPosition], targetAttendeeId);
                newEvent = newEvent.setIn(["boats", originBoatIndex], newOriginBoat);
            }
        } else {
            if (originBoatIndex === targetBoatIndex) {
                newTargetBoat = newTargetBoat.deleteIn(["seatAssignments", originPlacement.seatPosition], targetAttendeeId);
                movingWithinBoat = true;
            } else {
                const newOriginBoat = originBoat.deleteIn(["seatAssignments", originPlacement.seatPosition], targetAttendeeId);
                newEvent = newEvent.setIn(["boats", originBoatIndex], newOriginBoat);
            }
        }
    }

    const alreadyInTargetBoat = targetBoat
        .get("seatAssignments")
        .valueSeq()
        .includes(movedAttendeeId);

    if (alreadyInTargetBoat && !movingWithinBoat) {
        return state;
    }

    newEvent = newEvent.setIn(["boats", targetBoatIndex], newTargetBoat);

    const newState = Object.create(state);
    newState.event = newEvent;

    return newState;
};