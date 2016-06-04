import { connect } from "react-redux";
import { List } from "immutable";
import { bindActionCreators } from "redux";

import AttendeeList from "../components/attendee-list";
import { unassignAttendee, changeEventDetails, createBoat } from "../action-creators";
import AttendeeListItemRecord from "../models/attendee-list-item-record";

export const mapStateToProps = state => {
  const { attendees, boats, eventDetails } = state;
  const assignedAttendeeIds = boats.map(boat => boat.assignedSeats.valueSeq()).valueSeq().flatten();
  
  const attendeeListItems = attendees.map(attendee => 
    new AttendeeListItemRecord({
      attendee,
      isAssigned: assignedAttendeeIds.contains(attendee.attendeeId)
    })
  );
    
  return { 
    attendeeListItems,
    eventDetails
  };
};

const actionCreators = { unassignAttendee, changeEventDetails, createBoat };
export const mapDispatchToProps = dispatch => bindActionCreators(actionCreators, dispatch);

const AttendeeListContainer = connect(mapStateToProps, mapDispatchToProps)(AttendeeList);
export default AttendeeListContainer