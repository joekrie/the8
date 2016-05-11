import Radium from "radium";
import { Component } from "react"

import BoatSeatComponent from "./boat-seat.component";

const styles = {
    root: {
        "width": "300px",
        "backgroundColor": "#263751",
        "display": "inline-block",
        "marginRight": "20px",
        "color": "#F5F5F5"
    },
    header: {
        "backgroundColor": "#263F52",
        "marginBottom": "10px",
        "padding": "10px"
    }
};

@Radium
class BoatComponent extends Component {
    render() {
        const { boat, attendees, placeAttendees } = this.props;
        
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

            const isTargetSeatOpen = boat.seatAssignments.has(targetSeat.seatNumber);  console.log(`isTargetSeatOpen: ${isTargetSeatOpen}`);
            const isSwapWithAssigned = draggedOriginSeat && !isTargetSeatOpen;         console.log(`isSwapWithAssigned: ${isSwapWithAssigned}`);
            const isSwapWithUnassigned = !draggedOriginSeat && !isTargetSeatOpen;      console.log(`isSwapWithUnassigned: ${isSwapWithUnassigned}`);
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

        const attendeesBySeat = boat.seatAssignments
            .map(attendeeId => attendees.find(a => a.attendeeId === attendeeId));
            
        const createBoatSeat = seat => (
            <BoatSeatComponent key={seat.seatNumber} 
                seat={seat} 
                attendee={attendeesBySeat.get(seat.seatNumber)}
                placeAttendees={placeAttendees} 
                previewPlacement={previewPlacement} />
        );

        const boatSeats = boat.listSeats().map(createBoatSeat);
		
        return (
            <div style={styles.root}>
			    <div>
				    <div style={styles.header}>
			            {boat.title}
				    </div>
				    <div>
			            {boatSeats}
				    </div>
			    </div>
		    </div>
	    );
    }
}

export default BoatComponent