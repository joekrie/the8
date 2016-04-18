import { Component } from "react";
import Attendee from "../components/Attendee";
import Radium from "radium";
import { DropTarget } from "react-dnd";
import { defaultDropCollector } from "../../common/dndDefaults";

export const dropSpec = {
    drop: ({ placeAttendees }, monitor) => {
        const dragItem = monitor.getItem();

        if (!dragItem) {
            return;
        }

        placeAttendees({});
    }
};
    
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
@DropTarget("ATTENDEE", dropSpec, defaultDropCollector)
@Radium
export default class extends Component {
    render() {
        const { rowers, coxswains } = this.props;
        const assignableAttendees = rowers.concat(coxswains);

        const attendeeComponents = assignableAttendees.map(attendee =>
            <Attendee key={attendee.attendeeId} attendee={attendee} />
        );

        return (
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