import { Component, PropTypes } from "react";
import { DropTarget } from "react-dnd";
import UnassignedAttendeeList from "./UnassignedAttendeeList";

const spec = {
	drop: (props, monitor) => {
		const { attendeeId } = monitor.getItem();
		const { onUnassignAttendee } = props;

		onUnassignAttendee(attendeeId);
	}
};

const collect = connect => ({
	connectDropTarget: connect.dropTarget()
});

@DropTarget("ATTENDEE", spec, collect)
export default class extends Component {
	render() {
		const { unassignedAttendees, connectDropTarget } = this.props;

	    return connectDropTarget(
	        <div>
                <UnassignedAttendeeList unassignedAttendees={unassignedAttendees} />
            </div>
		);
	}
}