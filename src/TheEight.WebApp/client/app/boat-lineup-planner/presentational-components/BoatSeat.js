import AttendeeDragSource from "../dnd-components/AttendeeDragSource";
import Radium from "radium";

const BoatSeat = ({ attendee, seat, boatId }) => {
    let attendeeComponent = null;

    if (attendee) {
        attendeeComponent = (
            <AttendeeDragSource key={attendee.attendeeId}
                attendee={attendee} seat={seat} boatId={boatId} />
        );
    }

    const label = seat === 0 ? "COX" : seat;

    return (
        <div style={styles.root}>
            <div style={styles.label}>
                {label}
            </div>
            {attendeeComponent}
        </div>
    );
};

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

export default Radium(BoatSeat);