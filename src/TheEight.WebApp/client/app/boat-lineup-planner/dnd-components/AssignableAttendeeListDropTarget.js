import { Component, PropTypes } from "react";
import { DropTarget } from "react-dnd";
import AssignableAttendeeList from "../presentational-components/AssignableAttendeeList";
import { defaultDropCollector } from "../../common/dndDefaults";
import { connect } from "react-redux";
import { actionCreators } from "../reducers";

const drop = ({ dispatch }, monitor) => {
    const dragItem = monitor.getItem();

    if (!dragItem) {
        return;
    }

    const action = actionCreators.unassignAttendee({
        previousPlacement: dragItem.currentPlacement
    });

    dispatch(action);
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