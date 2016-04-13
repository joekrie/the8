import { Component } from "react";
import { DropTarget } from "react-dnd";
import AssignableAttendeeList from "../presentational-components/AssignableAttendeeList";
import { defaultDropCollector } from "../../common/dndDefaults";
import { connect } from "react-redux";

const drop = ({ placeAttendees }, monitor) => {
    const dragItem = monitor.getItem();

    if (!dragItem) {
        return;
    }
    
    placeAttendees({});
};

export const dropSpec = { drop };

@DropTarget("ATTENDEE", dropSpec, defaultDropCollector)
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