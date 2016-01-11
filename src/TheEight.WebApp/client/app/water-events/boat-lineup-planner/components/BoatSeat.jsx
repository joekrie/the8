import Attendee from "./Attendee";
import seatIsEmpty from "../utils/seatIsEmpty";

function createAttendee(seat) {
    if (seatIsEmpty(seat)) {
        return null;
    }

    const attendeeId = seat.getIn(["attendee", "id"]);
    const attendee = seat.get("attendee");

    return <Attendee key={attendeeId} attendee={attendee} />;
}

export default function(props) {		
    const { seat, seatPosition } = props;
    const attendee = createAttendee(seat);

    return (
        <div className="seat">
            <div className="label">
                {seatPosition}
            </div>
            {attendee}
        </div>
    );
}