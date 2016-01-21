import { Component, PropTypes } from "react";
import { DropTarget } from "react-dnd";
import BoatSeat from "./BoatSeat";

const spec = {
	drop: (props, monitor) => {
		const { attendeeId } = monitor.getItem();
		const { assignAttendee, boatId, seatPosition } = props;

	    assignAttendee({ attendeeId, boatId, seatPosition });
	},
	canDrop: props => !props.attendee
};

const collect = connect => ({
	connectDropTarget: connect.dropTarget()
});

@DropTarget("ATTENDEE", spec, collect)
export default class extends Component {
	render() {
	    const { connectDropTarget, attendee, seatPosition } = this.props;

		return connectDropTarget(
			<div>
                <BoatSeat attendee={attendee} 
                          seatPosition={seatPosition} />
			</div>
		);
	}
}