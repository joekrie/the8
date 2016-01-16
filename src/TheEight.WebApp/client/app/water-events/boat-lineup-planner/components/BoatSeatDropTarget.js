import { Component, PropTypes } from "react";
import { DropTarget } from "react-dnd";
import BoatSeat from "./BoatSeat";

const seatIsEmpty = seat => {
    return !Boolean(seat.get("attendee"));
};

const spec = {
	drop: (props, monitor) => {
		const { attendeeId } = monitor.getItem();
		const { assignAttendee, boatId, seatPosition } = props;

	    assignAttendee({ attendeeId, boatId, seatPosition });
	},
	canDrop: props => seatIsEmpty(props.seat)
};

const collect = connect => ({
	connectDropTarget: connect.dropTarget()
});

@DropTarget("ATTENDEE", spec, collect)
export default class extends Component {
	render() {
	    const { connectDropTarget, seat, seatPosition } = this.props;

		return connectDropTarget(
			<div>
                <BoatSeat seat={seat} seatPosition={seatPosition} />
			</div>
		);
	}
}