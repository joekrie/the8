import BoatSeatDropTarget from "./BoatSeatDropTarget";
import Radium from "radium";
import { range } from "lodash";

const Boat = props => {
    const { boat, assignAttendee, moveAttendee } = props;
    const boatId = boat.get("boatId");

    const firstSeatNum = boat.get("isCoxed") ? 0 : 1;

    const boats = range(firstSeatNum, boat.get("seatCount") + 1)
        .map(seatPosition => {
            const attendee = boat.getIn(["seatAssignments", String(seatPosition)]);
            const placement = { boatId, seatPosition };

            return <BoatSeatDropTarget key={seatPosition}
                                       placement={placement}
                                       attendee={attendee}
                                       assignAttendee={assignAttendee}
                                       moveAttendee={moveAttendee} />;
        });
		
	return (
		<div style={[styles.root]}>
			<div>
				<div style={[styles.header]}>
					{boat.get("title")}
				</div>
				<div>
					{boats}
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