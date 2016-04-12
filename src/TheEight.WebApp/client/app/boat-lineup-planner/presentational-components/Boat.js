import BoatSeatDropTarget from "../dnd-components/BoatSeatDropTarget";
import Radium from "radium";
import { range } from "lodash";

const Boat = ({ boat, assignAttendee, unassignAttendee }) => {
    const createBoatSeat = seat => {
        const attendee = boat.seatAssignments.get(seat);

        const placement = {
            boatId: boat.boatId,
            seat
        };

        return (
            <BoatSeatDropTarget key={seat}
                placement={placement}
                attendee={attendee}
                assignAttendee={assignAttendee}
                unassignAttendee={unassignAttendee} />
        );
    }

    const boatSeats = boat
        .getSeats()
        .map(createBoatSeat);
		
	return (
		<div style={styles.root}>
			<div>
				<div style={styles.header}>
					{boat.title}
				</div>
				<div>
					{boatSeats}
				</div>
			</div>
		</div>
	);
};

const styles = {
    root: {
        "width": "300px",
        "backgroundColor": "#263751",
        "display": "inline-block",
        "marginRight": "20px",
        "color": "#F5F5F5"
    },
    header: {
        "backgroundColor": "#263F52",
        "marginBottom": "10px",
        "padding": "10px"
    }
};

export default Radium(Boat);