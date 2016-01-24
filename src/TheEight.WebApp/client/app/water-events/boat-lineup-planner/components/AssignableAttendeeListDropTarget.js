import { Component, PropTypes } from "react";
import { DropTarget } from "react-dnd";
import AssignableAttendeeList from "./AssignableAttendeeList";

const spec = {
    drop: (props, monitor) => {
        const dragItem = monitor.getItem();

        if (!dragItem) {
            return;
        }
        
		const { attendeeId, originPlacement } = dragItem;
		const { unplaceAttendee } = props;

		unplaceAttendee({ 
		    movedAttendeeId: attendeeId, 
		    originPlacement 
		});
	}
};

const collect = connect => ({
	connectDropTarget: connect.dropTarget()
});

@DropTarget("ATTENDEE", spec, collect)
export default class extends Component {
	render() {
	    const { assignableAttendees, connectDropTarget } = this.props;

	    return connectDropTarget(
	        <div>
                <AssignableAttendeeList assignableAttendees={assignableAttendees} />
            </div>
		);
	}
}