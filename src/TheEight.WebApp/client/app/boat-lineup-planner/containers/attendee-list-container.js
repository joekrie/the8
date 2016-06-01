import { connect } from "react-redux";
import { List } from "immutable";
import { bindActionCreators } from "redux";

import AttendeeList from "../components/attendee-list";
import { unassignAttendee } from "../action-creators";
import AttendeeListItemRecord from "../models/attendee-list-item-record";

export const mapStateToProps = ({attendees, boats }) => {
  const assignedAttendeeIds = boats.map(boat => boat.assignedSeats.valueSeq()).flatten();
  
  const attendeeListItems = attendees.map(attendee => 
    new AttendeeListItemRecord({
      attendee,
      isAssigned: assignedAttendeeIds.contains(attendee.attendeeId)
    })
  );
  
  return { attendeeListItems };
};

export const mapDispatchToProps = dispatch => bindActionCreators({ unassignAttendee }, dispatch);

const AttendeeListContainer = connect(mapStateToProps, mapDispatchToProps)(AttendeeList);
export default AttendeeListContainer