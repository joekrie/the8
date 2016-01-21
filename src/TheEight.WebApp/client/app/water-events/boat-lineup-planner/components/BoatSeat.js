import AttendeeDragSource from "./AttendeeDragSource";
import Radium from "radium";
import clearfix from "../../../common/styles/clearfix";

const createAttendee = attendee => {
    if (!attendee) {
        return null;
    }

    const attendeeId = attendee.get("attendeeId");
    return <AttendeeDragSource key={attendeeId} attendee={attendee} />;
};

const BoatSeat = props => {
    const { attendee, seatPosition } = props;
    const attendeeComponent = createAttendee(attendee);

    return (
        <div style={styles.root}>
            <div style={styles.label}>
                {seatPosition}
            </div>
            {attendeeComponent}
        </div>
    );
};

const styles = {
    root: Object.assign({
        "height": "50px"
    }, clearfix),
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