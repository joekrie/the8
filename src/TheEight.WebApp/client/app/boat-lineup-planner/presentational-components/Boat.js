import BoatSeatDropTarget from "../dnd-components/BoatSeatDropTarget";
import Radium from "radium";

const Boat = ({ boat, placeAttendees }) => {
    const createBoatSeat = seat => {
        const attendee = boat.seatAssignments.get(seat);
        const boatId = { boat };
        const placement = { boatId, seat };

        return (
            <BoatSeatDropTarget key={seat}
                placement={placement}
                attendee={attendee}
                placeAttendees={placeAttendees} />
        );
    }

    const boatSeats = boat
        .listSeats()
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