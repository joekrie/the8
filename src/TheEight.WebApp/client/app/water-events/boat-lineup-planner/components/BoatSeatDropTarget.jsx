import React from "react";
import { DropTarget } from "react-dnd";
import { seatIsEmpty } from "../utils/boatSeatUtils";
import BoatSeat from "./BoatSeat";

const spec = {
	drop: (props, monitor) => {
		const { attendeeId } = monitor.getItem();
		const { assignAttendee, boatKey, seatPosition } = props;		
		assignAttendee(attendeeId, boatKey, seatPosition);
	},
	canDrop: props => seatIsEmpty(props.seat)
};

const collect = (connect, monitor) => ({
	connectDropTarget: connect.dropTarget()
});

@DropTarget("ATTENDEE", spec, collect)
export default class extends React.Component {
	render() {
	    const { connectDropTarget, seat, seatPosition } = this.props;

		return connectDropTarget(
			<div>
                <BoatSeat seat={seat} seatPosition={seatPosition} />
			</div>
		);
	}
}