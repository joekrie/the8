import Radium from "radium";
import { Component } from "react"

import BoatSeatList from "./boat-seat-list.component";
import BoatHeader from "./boat-header.component";


@Radium
class Boat extends Component {
    render() {
        const { boat: {boatInfo, seats }, attendees } = this.props;
        
        const previewPlacement = ({ draggedOriginSeat, draggedAttendeeId }, targetSeat) => {
            const isMoveWithinBoat = draggedOriginSeat && draggedOriginSeat.boatId === targetSeat.boatId;
            const isAttendeeAlreadyInBoat = attendees.map(attn => attn.attendeeId).contains(draggedAttendeeId);
            const isSameSeat = isMoveWithinBoat && draggedOriginSeat.seatNumber === targetSeat.seatNumber;
            const isAllowed = !isSameSeat && (isMoveWithinBoat || !isAttendeeAlreadyInBoat);

            const actionPayload = {
                allow: isAllowed,
                assignments: [],
                unassignments: []
            };  
            
            if (!isAllowed) {
                return actionPayload;
            }

            const attendeeInTargetSeat = boat.seatAssignments.get(targetSeat.seatNumber);
            const targetAttendeeId = attendeeInTargetSeat ? attendeeInTargetSeat.attendeeId : "";
            
            const assignTargetToDropped = () => {
                actionPayload.assignments.push({
                    attendeeId: targetAttendeeId,
                    seat: draggedOriginSeat
                });
            };

            const assignDroppedToTarget = () => {
                actionPayload.assignments.push({
                    attendeeId: draggedAttendeeId,
                    seat: targetSeat
                });
            };

            const unassignTarget = () => {
                actionPayload.unassignments.push(targetSeat);
            };

            const wasDraggedAssigned = Boolean(draggedOriginSeat);
            const isTargetSeatOpen = boat.seatAssignments.has(targetSeat.seatNumber);  console.log(`isTargetSeatOpen: ${isTargetSeatOpen}`);
            const isSwapWithAssigned = wasDraggedAssigned && !isTargetSeatOpen;         console.log(`isSwapWithAssigned: ${isSwapWithAssigned}`);
            const isSwapWithUnassigned = !wasDraggedAssigned && !isTargetSeatOpen;      console.log(`isSwapWithUnassigned: ${isSwapWithUnassigned}`);
            const isMoveWithinBoatToOpenSeat = isMoveWithinBoat && isTargetSeatOpen;   console.log(`isMoveWithinBoatToOpenSeat: ${isMoveWithinBoatToOpenSeat}`);
            const isOutsideBoatToOpenSeat = !isMoveWithinBoat && isTargetSeatOpen;     console.log(`isOutsideBoatToOpenSeat: ${isOutsideBoatToOpenSeat}`);
            
            if (isSwapWithAssigned) {
                assignTargetToDropped();
                assignDroppedToTarget();
            }

            if (isSwapWithUnassigned || isMoveWithinBoatToOpenSeat) {
                unassignTarget();
                assignDroppedToTarget();
            }

            if (isOutsideBoatToOpenSeat) {
                assignDroppedToTarget();
            }

            return actionPayload;
        };

        const styles = {
            "width": "300px",
            "backgroundColor": "#263751",
            "display": "inline-block",
            "marginRight": "20px",
            "color": "#F5F5F5"
        };

        return (
            <div style={styles}>
			    <div>
				    <BoatHeader boatInfo={boatInfo} />
				    <BoatSeatList seats={seats} previewPlacement={previewPlacement} />
			    </div>
		    </div>
	    );
    }
}

export default Boat