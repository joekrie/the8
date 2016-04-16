import { Component } from "react";
import { DropTarget } from "react-dnd";
import BoatSeat from "../presentational-components/BoatSeat";
import { defaultDropCollector } from "../../common/dndDefaults";

const canDrop = ({ attendeeIdsInBoat }, monitor) => {
    const draggedAttendee = monitor.getItem();

    if (!draggedAttendee) {
        return false;
    }

    return !attendeeAlreadyInBoat(draggedAttendee.attendeeId, attendeeIdsInBoat);
};

const attendeeAlreadyInBoat = (attendeeId, attendeeIdsInBoat) => 
    attendeeIdsInBoat.contains(attendeeId);

const drop = (props, monitor) => {
    if (!monitor.getItem() || !monitor.canDrop()) {
        return;
    }

    const { placeAttendees } = props;

    const draggedPlacement = monitor.getItem();
    const draggedAttendeeId = draggedPlacement.attendeeId;
    const draggedPreviousBoatId = draggedPlacement.boatId;
    const draggedPreviousSeat = draggedPlacement.seat;

    const targetAttendeeId = props.attendee.attendeeId;
    const targetBoatId = props.boatId;
    const targetSeat = props.seat;
    
    const attendeeInTargetSeat = Boolean(props.attendee);
    const droppedAttendeeWasAssigned = Boolean(attendee.boatId) && Boolean(attendee.seat);

    const actionPayload = {
        assignments: [],
        unassignments: []
    };

    const assignTargetToDropped = () => {
        actionPayload.assignments.push({
            attendeeId: targetAttendeeId,
            boatId: draggedPreviousBoatId,
            seat: draggedPreviousSeat
        });
    };

    const assignDroppedToTarget = () => {
        actionPayload.assignments.push({
            attendeeId: draggedAttendeeId,
            boatId: targetBoatId,
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
	    const { connectDropTarget, attendee, boatId, seat } = this.props;
	    const boatSeatProps = { attendee, boatId, seat };

		return connectDropTarget(
			<div>
                <BoatSeat {...boatSeatProps} />
			</div>
		);
	}
}