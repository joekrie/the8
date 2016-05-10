import Radium from "radium";
import { Component } from "react"

import BoatSeatComponent from "./boat-seat.component";

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

@Radium
class BoatComponent extends Component {
    render() {
        const { boat, attendees, placeAttendees } = this.props;

        const attendeesBySeat = boat.seatAssignments
            .map(attendeeId => attendees.find(a => a.attendeeId === attendeeId));

        const attendeeIdsInBoat = attendees.map(attn => attn.attendeeId).valueSeq();

        const createBoatSeat = seat => (
            <BoatSeatComponent key={seat.seatNumber} seat={seat} 
                attendee={attendeesBySeat.get(seat.seatNumber)}
                placeAttendees={placeAttendees} 
                attendeeIdsInBoat={attendeeIdsInBoat} />
        );

        const boatSeats = boat.listSeats().map(createBoatSeat);
		
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
    }
}

export default BoatComponent