import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import AssignedAttendee from "../components/assigned-attendee";

const mapStateToProps = ({ attendees }) => ({ attendees });

const mergeProps = ({ attendees }, {}, { seat }) => {
  const attendee = attendees.find(attendee => attendee.attendeeId === seat.attendeeId);
  return { attendee };
};

export default AssignedAttendeeContainer = connect(mapStateToProps, null, mergeProps)(AssignedAttendee);