import { Component, PropTypes } from "react";
import { DropTarget } from "react-dnd";
import BoatSeat from "./BoatSeat";

const spec = {
    drop: (props, monitor) => {
        const { assignAttendee, moveAttendee, placement } = props;
        const dragItem = monitor.getItem();

        if (dragItem) {
            const { attendeeId, oldPlacement } = dragItem;

            if (oldPlacement) {
                moveAttendee({ attendeeId, newPlacement: placement, oldPlacement });
            } else {
                assignAttendee({ attendeeId, newPlacement: placement });
            }
        }
    },
	canDrop: props => !props.attendee
};

const collect = connect => ({
	connectDropTarget: connect.dropTarget()
});

@DropTarget("ATTENDEE", spec, collect)
export default class extends Component {
	render() {
	    const { connectDropTarget, attendee, placement } = this.props;

		return connectDropTarget(
			<div>
                <BoatSeat attendee={attendee} 
	                      placement={placement} />
			</div>
		);
	}
}