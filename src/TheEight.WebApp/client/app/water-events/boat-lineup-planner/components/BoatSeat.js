import AttendeeDragSource from "./AttendeeDragSource";
import Radium from "radium";

const BoatSeat = ({ attendee, placement }) => {
    let attendeeComponent;

    if (attendee) {
        const attendeeId = attendee.get("attendeeId");

        attendeeComponent = (
            <AttendeeDragSource key={attendeeId}
                attendee={attendee}
                currentPlacement={placement} />
        );
    } else {
        attendeeComponent = null;
    }

    const label = placement.seatPosition === "0" ? "COX" : placement.seatPosition;

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