import Radium from "radium";
import { Component } from "react";
import { DropTarget } from "react-dnd";

import { defaultDropCollector } from "../../common/dnd-defaults";
import AttendeeComponent from "./attendee";

const dropSpec = {
    drop: ({ placeAttendees }, monitor) => {
        const dragItem = monitor.getItem();

        if (!dragItem) {
            return;
        }
        
        const { draggedOriginSeat } = monitor.getItem();

        placeAttendees({
            assignments: [],
            unassignments: [
                draggedOriginSeat
            ]
        });
    }
};

@DropTarget("ATTENDEE", dropSpec, defaultDropCollector)
@Radium
class AttendeeListComponent extends Component {
    render() {
        const { rowers, coxswains, connectDropTarget } = this.props;
        const assignableAttendees = rowers.concat(coxswains);

        const attendeeComponents = assignableAttendees.map(attendee =>
            <AttendeeComponent key={attendee.attendeeId} attendee={attendee} />
        );
    
        const styles = {
            root: {
                "float": "left",
                "width": "300px",
                "backgroundColor": "#263751",
                "marginRight": "20px"
            },
            attendeeList: {
                "padding": "15px"
            },
            attendee: {
                "marginBottom": "10px"
            },
            header: {
                "backgroundColor": "#263F52",
                "color": "#F5F5F5",
                "marginBottom": "10px",
                "padding": "10px"
            }
        };

        return connectDropTarget(
            <div style={styles.root}>
                <div style={styles.header}>
                    Unassigned
                </div>
                <div style={styles.attendeeList}>
                    {attendeeComponents}
                </div>
		    </div>
        );
    }
};

export { dropSpec }
export default AttendeeListComponent