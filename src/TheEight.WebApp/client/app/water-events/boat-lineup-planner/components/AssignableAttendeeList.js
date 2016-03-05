import AttendeeDragSource from "./AttendeeDragSource";
import Radium from "radium";

const AssignableAttendeeList = props => {
    const { assignableAttendees } = props;

    return (
        <div style={styles.root}>
            <div style={styles.header}>
                Unassigned
            </div>
            <div style={styles.attendeeList}>
                {assignableAttendees.map(attendee => 
                    <AttendeeDragSource key={attendee.get("attendeeId")} 
                                        attendee={attendee} />)}
            </div>
		</div>
    );
};

AssignableAttendeeList.propTypes = {

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

export default Radium(AssignableAttendeeList);