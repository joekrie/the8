import _ from "lodash";

export const attendeeMoveTypes = {
    WITHIN_BOAT_TO_EMPTY_SEAT: 1,
    SWAP_WITHIN_BOAT: 2,
    FROM_OTHER_BOAT_TO_EMPTY_SEAT: 3,
    SWAP_FROM_OTHER_BOAT: 4,
    UNASSIGNED_TO_EMPTY_SEAT: 5,
    UNASSIGNED_TO_OCCUPIED_SEAT: 6
};

export const placeAttendee = (state, action) => {
    const { targetPlacement, movedAttendeeId, originPlacement, targetAttendeeId } = action.payload;
    const { event } = state;

    const { moveType } = previewPlaceAttendee(event.get("boats"), originPlacement, targetPlacement, movedAttendeeId);
    
    const [targetBoatIndex, targetBoat] = 
        event.get("boats")
            .findEntry(boat => boat.get("boatId") === targetPlacement.boatId);

    let newTargetBoat = targetBoat.setIn(["seatAssignments", targetPlacement.seatPosition], movedAttendeeId);
    let newEvent = Object.create(event);

    if (moveType === attendeeMoveTypes.SWAP_WITHIN_BOAT){
        newTargetBoat = newTargetBoat.setIn(["seatAssignments", originPlacement.seatPosition], targetAttendeeId);
        newEvent = newEvent.setIn(["boats", targetBoatIndex], newTargetBoat);
    }
    
    if (moveType === attendeeMoveTypes.SWAP_FROM_OTHER_BOAT) {
        const newOriginBoat = originBoat.setIn(["seatAssignments", originPlacement.seatPosition], targetAttendeeId);
        newEvent = newEvent.setIn(["boats", originBoatIndex], newOriginBoat);
    }

    if (moveType === attendeeMoveTypes.WITHIN_BOAT_TO_EMPTY_SEAT) {
        newTargetBoat = newTargetBoat.deleteIn(["seatAssignments", originPlacement.seatPosition], targetAttendeeId);
        newEvent = newEvent.setIn(["boats", targetBoatIndex], newTargetBoat);
    }

    if (moveType === attendeeMoveTypes.FROM_OTHER_BOAT_TO_EMPTY_SEAT) {
        const newOriginBoat = originBoat.deleteIn(["seatAssignments", originPlacement.seatPosition], targetAttendeeId);
        newEvent = newEvent.setIn(["boats", originBoatIndex], newOriginBoat);
    }
       
    const newState = Object.create(state);
    newState.event = newEvent;

    return newState;
};

export const previewPlaceAttendee = (boats, originPlacement, targetPlacement, movedAttendeeId) => {
    const originBoat = boats.find(boat => boat.get("boatId") === _.get(originPlacement, "boatId"));
    const targetBoat = boats.find(boat => boat.get("boatId") === targetPlacement.boatId);

    const targetAttendeeId = _.invoke(targetBoat, "getIn", ["seatAssignments", targetPlacement.seatPosition]);
    const attendeeInTarget = Boolean(targetAttendeeId);
    
    const movingWithinBoat = _.get(originPlacement, "boatId") === _.get(targetPlacement, "boatId");
    const attendeeWasUnassigned = Boolean(originPlacement);

    const alreadyInTargetBoat = 
        targetBoat
            .get("seatAssignments")
            .valueSeq()
            .includes(movedAttendeeId);

    if (alreadyInTargetBoat && !movingWithinBoat) {
        return {
            isAllowed: false
        };
    }
    
    let moveType;

    if (attendeeWasUnassigned) { 
        moveType = attendeeInTarget 
            ? attendeeMoveTypes.UNASSIGNED_TO_OCCUPIED_SEAT
            : attendeeMoveTypes.UNASSIGNED_TO_EMPTY_SEAT;
    } else {
        if (attendeeInTarget) {
            moveType = movingWithinBoat 
                ? attendeeMoveTypes.SWAP_WITHIN_BOAT
                : attendeeMoveTypes.SWAP_FROM_OTHER_BOAT;
        } else {
            moveType = movingWithinBoat 
                ? attendeeMoveTypes.WITHIN_BOAT_TO_EMPTY_SEAT
                : attendeeMoveTypes.FROM_OTHER_BOAT_TO_EMPTY_SEAT;
        }
    }

    return {
        isAllowed: true,
        moveType: moveType
    };
};