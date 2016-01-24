import AttendeeDragSource from "./AttendeeDragSource";
import Radium from "radium";

const BoatSeat = props => {
    const { attendee, placement } = props;

    let attendeeComponent;

    if (attendee) {
        const attendeeId = attendee.get("attendeeId");

        attendeeComponent = 
            <AttendeeDragSource key={attendeeId} 
                                attendee={attendee} 
                                placement={placement}/>;
    } else {
        attendeeComponent = null;
    }

    return (
        <div style={styles.root}>
            <div style={styles.label}>
                {placement.seatPosition}
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