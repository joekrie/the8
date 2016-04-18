import BoatSeat from "../components/BoatSeat";
import Radium from "radium";

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

const Boat = ({ boat, attendees, placeAttendees }) => {
    const attendeesBySeat = boat
        .seatAssignments
        .map(attendeeId =>
            attendees.find(a => a.attendeeId === attendeeId));

    const attendeeIdsInBoat = attendees
        .map(attn => attn.attendeeId)
        .valueSeq();

    const createBoatSeat = seat => {
        const attendee = attendeesBySeat.get(seat.seatNumber);
        
        const seatProps = {
            seat,
            attendee,
            placeAttendees,
            attendeeIdsInBoat
        };
        
        return <BoatSeat key={seat.seatNumber} {...seatProps} />;
    };

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

export default Radium(Boat);