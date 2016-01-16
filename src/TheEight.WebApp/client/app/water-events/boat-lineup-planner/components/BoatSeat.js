import AttendeeDragSource from "./AttendeeDragSource";
import Radium from "radium";
import clearfix from "../../../common/styles/clearfix";

const seatIsEmpty = seat => {
    return !Boolean(seat.get("attendee"));
};

const createAttendee = seat => {
    if (seatIsEmpty(seat)) {
        return null;
    }

    const attendeeId = seat.getIn(["attendee", "id"]);
    const attendee = seat.get("attendee");

    return <AttendeeDragSource key={attendeeId} attendee={attendee}  />;
};

const BoatSeat = props => {
    const { seat, seatPosition } = props;
    const attendee = createAttendee(seat);

    return (
        <div style={[styles.root]}>
            <div style={[styles.label]}>
                {seatPosition}
            </div>
            {attendee}
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