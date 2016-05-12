import Radium from "radium";
import { Component } from "react";
import { DropTarget } from "react-dnd";

import Attendee from "./attendee.component";
import { defaultDropCollector } from "../common/dnd-defaults";

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
class Seat extends Component {
    render() {
        const { connectDropTarget, attendee, seat: { seatInfo: { seatNumber }, isOccupied } } = this.props;
        const attendeeComponent = isOccupied ? <Attendee attendee={attendee} seatInfo={seatInfo} /> : null;
        
        const coxswainLabel = "COX";
        const label = seatNumber === 0 ? coxswainLabel : seatNumber;
        
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
export default Seat