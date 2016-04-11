import AssignableAttendeeListDropTarget from "../dnd-components/AssignableAttendeeListDropTarget";
import { connect } from "react-redux";
import { actionCreators } from "../reducers";

export const attendeeIsAssignable = (attendee, boats, allowMultiple) => {
    if (allowMultiple) {
        return true;
    }

    const assigned = boats
        .flatMap(boat => boat.seatAssignments.valueSeq());

    const attendeeId = attendee.attendeeId;
    return !assigned.includes(attendeeId);
};

export const mapStateToProps = ({attendees, boats, settings}) => {
    const assignableAttendees = attendees
        .filter(a => attendeeIsAssignable(a, boats, settings.allowMultiple))
        .groupBy(a => a.isCoxswain ? "coxswains" : "rowers");
    
    return {
        coxswains: assignableAttendees
            .get("coxswains")
            .sortBy(a => a.sortName),
        rowers: assignableAttendees
            .get("rowers")
            .sortBy(a => a.sortName)
    };
};

export const mapDispatchToProps = dispatch => ({
    
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AssignableAttendeeListDropTarget);