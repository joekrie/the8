import _ from "lodash";
import previewPlaceAttendee, { attendeeMoveTypes } from "./utils/previewPlaceAttendee";

export const placeAttendee = (state, action) => {
    const { targetPlacement, movedAttendeeId, originPlacement, targetAttendeeId } = action.payload;
    const { event } = state;

    const { moveType } = previewPlaceAttendee(event.get("boats"), originPlacement, targetPlacement, movedAttendeeId);
    
    const boats = event.get("boats");
    const [targetBoatIndex, targetBoat] = boats.findEntry(boat => boat.get("boatId") === targetPlacement.boatId);
    const [originBoatIndex, originBoat] = boats.findEntry(boat => boat.get("boatId") === _.get(originPlacement, "boatId"));

    let newTargetBoat = targetBoat.setIn(["seatAssignments", targetPlacement.seatPosition], movedAttendeeId);
    
    let newEvent = Object.create(event);
    let newOriginBoat;

    switch (moveType) {
        case attendeeMoveTypes.SWAP_WITHIN_BOAT:
            newTargetBoat = newTargetBoat.setIn(["seatAssignments", originPlacement.seatPosition], targetAttendeeId);
            newEvent = newEvent.setIn(["boats", targetBoatIndex], newTargetBoat);
            break;
        case attendeeMoveTypes.SWAP_FROM_OTHER_BOAT:
            newOriginBoat = originBoat.setIn(["seatAssignments", originPlacement.seatPosition], targetAttendeeId);
            newEvent = newEvent.setIn(["boats", originBoatIndex], newOriginBoat);
            break;
        case attendeeMoveTypes.WITHIN_BOAT_TO_EMPTY_SEAT:
            newTargetBoat = newTargetBoat.deleteIn(["seatAssignments", originPlacement.seatPosition], targetAttendeeId);
            newEvent = newEvent.setIn(["boats", targetBoatIndex], newTargetBoat);
            break;
        case attendeeMoveTypes.FROM_OTHER_BOAT_TO_EMPTY_SEAT:
            newOriginBoat = originBoat.deleteIn(["seatAssignments", originPlacement.seatPosition], targetAttendeeId);
            newEvent = newEvent.setIn(["boats", originBoatIndex], newOriginBoat);
            break;
    }

    const newState = Object.create(state);
    newState.event = newEvent;

    return newState;
};