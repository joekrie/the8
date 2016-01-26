import { Component, PropTypes } from "react";
import { DropTarget } from "react-dnd";
import BoatSeat from "./BoatSeat";
import { previewPlaceAttendee, placeAttendee } from "../reducers/placeAttendee";
import _ from "lodash";

const spec = {
    drop: (props, monitor) => {
        const { placeAttendee, placement, attendee, boats } = props;
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
    },
    canDrop: (props, monitor) => {
        const { placement, attendee, boats } = props;
        const targetAttendeeId = attendee ? attendee.get("attendeeId") : null;
        const dragItem = monitor.getItem();
        
        if (!dragItem) {
            return false;
        }

        const { movedAttendeeId, originPlacement } = dragItem;
        const { isAllowed } = previewPlaceAttendee(boats, originPlacement, placement, movedAttendeeId);
        return isAllowed;
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