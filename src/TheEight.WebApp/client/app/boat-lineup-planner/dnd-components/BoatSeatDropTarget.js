import { Component } from "react";
import { DropTarget } from "react-dnd";
import BoatSeat from "../presentational-components/BoatSeat";
import { defaultDropCollector } from "../../common/dndDefaults";

const canDrop = (props, monitor) => {
    if (!monitor.getItem()) {
        return false;
    }

    const { draggedOriginSeat, draggedAttendeeId } = monitor.getItem();
    const { attendeeIdsInBoat } = props;
    const targetBoatId = props.seat.boatId;

    const sameBoat = draggedOriginSeat && draggedOriginSeat.boatId === targetBoatId;

    return sameBoat || !attendeeAlreadyInBoat(draggedAttendeeId, attendeeIdsInBoat);
};

const attendeeAlreadyInBoat = (attendeeId, attendeeIdsInBoat) => 
    attendeeIdsInBoat.contains(attendeeId);

const drop = (props, monitor) => {
    if (!monitor.getItem() || !monitor.canDrop()) {
        return;
    }
    
    const { draggedAttendeeId, draggedOriginSeat } = monitor.getItem();

    const { placeAttendees } = props;
    
    const attendeeInTargetSeat = Boolean(props.attendee);
    const droppedAttendeeWasAssigned = Boolean(draggedOriginSeat);

    const targetAttendeeId = attendeeInTargetSeat ? props.attendee.attendeeId : "";
    const targetSeat = props.seat;

    const actionPayload = {
        assignments: [],
        unassignments: []
    };

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
        actionPayload.unassignments = {
            attendeeId: targetAttendeeId
        }
    };

    if (droppedAttendeeWasAssigned && attendeeInTargetSeat) {
        assignTargetToDropped();
        assignDroppedToTarget();
    }

    if (!droppedAttendeeWasAssigned && attendeeInTargetSeat) {
        unassignTarget();
        assignDroppedToTarget();
    }

    if (!attendeeInTargetSeat) {
        assignDroppedToTarget();
    }

    placeAttendees(actionPayload);
};

export const dropSpec = { canDrop, drop };
export const dropCollect = defaultDropCollector;

@DropTarget("ATTENDEE", dropSpec, dropCollect)
export default class extends Component {
	render() {
	    const { connectDropTarget, attendee, seat } = this.props;
	    const boatSeatProps = { attendee, seat };

		return connectDropTarget(
			<div>
                <BoatSeat {...boatSeatProps} />
			</div>
		);
	}
}