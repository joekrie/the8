import { Component, PropTypes } from "react";
import { DropTarget } from "react-dnd";
import AssignableAttendeeList from "./AssignableAttendeeList";
import defaultDropCollector from "../../../common/defaultDropCollector";
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
export class AssignableAttendeeDropTarget extends Component {
	render() {
	    const { assignableAttendees, connectDropTarget } = this.props;

	    return connectDropTarget(
	        <div>
                <AssignableAttendeeList assignableAttendees={assignableAttendees} />
            </div>
		);
	}
}

export const mapStateToProps = state => {
    const attendeeIsAssignable = (attendee, settings) => {
        const allowMultiple = settings.get("allowMultipleAssignments");

        if (allowMultiple) {
            return true;
        }

        const assigned = event
            .get("boats")
            .flatMap(boat => boat.get("seatAssignments").valueSeq());

        const attendeeId = attendee.get("attendeeId");
        return !assigned.includes(attendeeId);
    };

    const sortAttendees = (x, y) => {
        if (x.get("position") === y.get("position")) {
            return x
                .get("sortName")
                .localeCompare(y.get("sortName"));
        }

        return x.get("position") === 0 ? -1 : 1;
    };

    return 

    const getAssignableAttendees =
        attendees => attendees
            .filter(attendeeIsAssignable)
            .sort(sortAttendees);
};

export default connect(mapStateToProps)(AssignableAttendeeDropTarget);