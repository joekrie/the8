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
    canDrop: ({ previewPlacement, seat }, monitor) => {
        if (!monitor.getItem()) {
            return false;
        }

        const draggedPlacement = monitor.getItem();
        const preview = previewPlacement(draggedPlacement, seat);
        return preview.allow;
    },
    drop: ({ previewPlacement, placeAttendees, seat, attendee }, monitor) => {
        const draggedPlacement = monitor.getItem();
        
        if (draggedPlacement || monitor.canDrop()) {
            const preview = previewPlacement(draggedPlacement, seat);
            placeAttendees(preview);
        }
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