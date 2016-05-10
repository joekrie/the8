import { connect } from "react-redux";
import { List } from "immutable";
import { bindActionCreators } from "redux";

import AttendeeListComponent from "./attendee-list.component";
import { placeAttendees } from "./action-creators";

const attendeeIsAssignable = (attendee, boats, allowMultiple) => {
    if (allowMultiple) {
        return true;
    }

    const assigned = boats.map(b => b.seatAssignments.valueSeq()).flatten();
    const attendeeId = attendee.attendeeId;
    return !assigned.contains(attendeeId);
};

const mapStateToProps = ({attendees, boats, eventSettings}) => {
    const assignableAttendees = attendees
        .filter(a => attendeeIsAssignable(a, boats, 
            eventSettings.allowMultipleAttendeeAssignments))
        .groupBy(a => a.isCoxswain ? "coxswains" : "rowers");

    const rowers = assignableAttendees.has("rowers")
        ? assignableAttendees.get("rowers").sortBy(a => a.sortName)
        : List();
    
    const coxswains = assignableAttendees.has("coxswains")
        ? assignableAttendees.get("coxswains").sortBy(a => a.sortName)
        : List();

    return { coxswains, rowers };
};

const mapDispatchToProps = dispatch => 
    bindActionCreators({ placeAttendees }, dispatch);

const AttendeeListContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(AttendeeListComponent);

export { mapDispatchToProps, mapStateToProps, attendeeIsAssignable }
export default AttendeeListContainer