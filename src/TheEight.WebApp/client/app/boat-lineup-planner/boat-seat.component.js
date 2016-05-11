import Radium from "radium";
import { Component } from "react";
import { DropTarget } from "react-dnd";

import Attendee from "./attendee.component";
import { defaultDropCollector } from "../common/dnd-defaults";

const styles = {
    root: {
        "height": "50px",
        "clear": "both"
    },
    label: {
        "float": "left",
        "height": "50px",
        "lineHeight": "50px",
        "whiteSpace": "nowrap",
        "marginLeft": "10px",
        "width": "30px"
    }
};

const dropSpec = {
    canDrop: ({ attendeeIdsInBoat, seat }, monitor) => {
        if (!monitor.getItem()) {
            return false;
        }

        const { draggedOriginSeat, draggedAttendeeId } = monitor.getItem();
        const targetBoatId = seat.boatId;

        const sameBoat = draggedOriginSeat && draggedOriginSeat.boatId === targetBoatId;
        const attendeeAlreadyInBoat = attendeeIdsInBoat.contains(draggedAttendeeId);
        return !sameBoat && !attendeeAlreadyInBoat;
    },
    drop: ({ placeAttendees, seat, attendee }, monitor) => {
        if (!monitor.getItem() || !monitor.canDrop()) {
            return;
        }

        const { draggedAttendeeId, draggedOriginSeat } = monitor.getItem();

        const attendeeInTargetSeat = Boolean(attendee);
        const droppedAttendeeWasAssigned = Boolean(draggedOriginSeat);

        const targetAttendeeId = attendeeInTargetSeat ? attendee.attendeeId : "";
        const targetSeat = seat;

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
    }
};

@DropTarget("ATTENDEE", dropSpec, defaultDropCollector)
@Radium
class BoatSeatComponent extends Component {
    render() {
        const { connectDropTarget, attendee, seat } = this.props;
        let attendeeComponent = null;

        if (attendee) {
            attendeeComponent = <Attendee key={attendee.attendeeId} attendee={attendee} seat={seat} />;
        }

        const label = seat.seatNumber === 0 ? "COX" : seat.seatNumber;

        return connectDropTarget(
            <div style={styles.root}>
                <div style={styles.label}>
                    {label}
                </div>
                {attendeeComponent}
            </div>
        );
    }
}

export { dropSpec }
export default BoatSeatComponent