import _ from "lodash";

export default (boats, originPlacement, targetPlacement, movedAttendeeId) => {
    const originBoat = boats.find(boat => boat.get("boatId") === _.get(originPlacement, "boatId"));
    const targetBoat = boats.find(boat => boat.get("boatId") === targetPlacement.boatId);

    const targetAttendeeId = _.invoke(targetBoat, "getIn", ["seatAssignments", targetPlacement.seatPosition]);
    const attendeeInTarget = Boolean(targetAttendeeId);
    
    const movingWithinBoat = _.get(originPlacement, "boatId") === _.get(targetPlacement, "boatId");
    const attendeeWasAssigned = Boolean(originPlacement);

    const alreadyInTargetBoat = 
        targetBoat
            .get("seatAssignments")
            .valueSeq()
            .includes(movedAttendeeId);

    if (alreadyInTargetBoat && !movingWithinBoat) {
        return {
            isAllowed: false,
            onMove: () => {}
        };
    }
    
    let moveType;

    if (attendeeWasAssigned) {
        if (attendeeInTarget) {
            moveType = movingWithinBoat 
                ? attendeeMoveTypes.SWAP_WITHIN_BOAT
                : attendeeMoveTypes.SWAP_FROM_OTHER_BOAT;
        } else {
            moveType = movingWithinBoat 
                ? attendeeMoveTypes.WITHIN_BOAT_TO_EMPTY_SEAT
                : attendeeMoveTypes.FROM_OTHER_BOAT_TO_EMPTY_SEAT;
        }       
    } else {
        moveType = attendeeInTarget 
           ? attendeeMoveTypes.UNASSIGNED_TO_OCCUPIED_SEAT
           : attendeeMoveTypes.UNASSIGNED_TO_EMPTY_SEAT;
    }

    return {
        isAllowed: true,
        onMove: () => {
            
        }
    };
};