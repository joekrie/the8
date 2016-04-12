import { Component } from "react";
import { DropTarget } from "react-dnd";
import BoatSeat from "../presentational-components/BoatSeat";
import { defaultDropCollector } from "../../common/dndDefaults";

const canDrop = ({ boat }, monitor) => {
    const dragItem = monitor.getItem();
        
    if (!dragItem) {
        return false;
    }
    
    const attendeeInBoat = boat.isAttendeeInBoat(dragItem.attendeeId);
    return !attendeeInBoat;
};

export const generateDropActions = () => {
    
};

const drop = ({ assignAttendee, unassignAttendee, placement, attendee, boat }, monitor) => {
    const dragItem = monitor.getItem();
        
    if (!dragItem) {
        return;
    }

    assignAttendee({
        nextPlacement: {
            boatId: placement.get("boatId"),
            seat: placement.get("seat")
        },
        attendeeId
    });
};

export const dropSpec = { canDrop, drop };

@DropTarget("ATTENDEE", dropSpec, defaultDropCollector)
export default class extends Component {
	render() {
	    const { connectDropTarget, attendee, placement } = this.props;

		return connectDropTarget(
			<div>
                <BoatSeat attendee={attendee} placement={placement} />
			</div>
		);
	}
}