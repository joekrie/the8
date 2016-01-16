import BoatSeatDropTarget from "./BoatSeatDropTarget";
import Radium from "radium";

const Boat = props => {
    const { boat, assignAttendee } = props;
    const boatId = boat.get("boatId");
		
	return (
		<div style={[styles.root]}>
			<div>
				<div style={[styles.header]}>
					{boat.get("title")}
				</div>
				<div>
					{boat.get("seatAssignments").map((seat, seatPosition) => 
					    <BoatSeatDropTarget key={seatPosition}
                                            boatId={boatId}
				                            seat={seat} 
				                            seatPosition={seatPosition}
				                            assignAttendee={assignAttendee} />)}
				</div>
			</div>
		</div>
	);
};

Boat.propTypes = {

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