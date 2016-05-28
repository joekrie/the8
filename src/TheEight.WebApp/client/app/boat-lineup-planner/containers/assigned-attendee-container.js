import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import AssignedAttendee from "../components/assigned-attendee";

export const mapStateToProps = ({ attendees }, { attendeeId }) => {
  const attendee = attendees.find(attendee => attendee.attendeeId === attendeeId);
  return { attendee };
};

const AssignedAttendeeContainer = connect(mapStateToProps)(AssignedAttendee);
export default AssignedAttendeeContainer