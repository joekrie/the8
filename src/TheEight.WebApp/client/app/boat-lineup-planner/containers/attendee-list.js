import { connect } from "react-redux";
import { List } from "immutable";
import { bindActionCreators } from "redux";

import AttendeeList from "../components/attendee-list";
import { unassignAttendeeInSeat } from "../action-creators";
import AttendeeListItemRecord from "../models/attendee-list-item";

const mapStateToProps = ({attendees, boats }) => {
  const assignedAttendeeIds = boats.map(boat => boat.assignedSeats.valueSeq()).flatten();
  
  const listItems = attendees.map(attendee => 
    new AttendeeListItemRecord({
      attendee,
      isAssigned: assignedAttendeeIds.contains(attendee.attendeeId)
    })
  );
  
  return {
    attendees: listItems
  };
};

const mapDispatchToProps = dispatch => bindActionCreators({ unassignAttendeeInSeat }, dispatch);
const AttendeeListContainer = connect(mapStateToProps, mapDispatchToProps)(AttendeeList);

export { mapDispatchToProps, mapStateToProps, attendeeIsAssignable }
export default AttendeeListContainer