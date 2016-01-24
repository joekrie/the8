import { Component, PropTypes } from "react";
import { DropTarget } from "react-dnd";
import BoatSeat from "./BoatSeat";

const spec = {
    drop: (props, monitor) => {
        const { placeAttendee, placement, attendee } = props;
        const targetAttendeeId = attendee ? attendee.get("attendeeId") : null;
        const dragItem = monitor.getItem();
        
        if (!dragItem) {
            return;
        }

        const { movedAttendeeId, originPlacement } = dragItem;

        placeAttendee({
            targetPlacement: placement,
            movedAttendeeId,
            originPlacement,            
            targetAttendeeId
        });
    }
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