import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import Seat from "../components/seat";
import { placeAttendees } from "../action-creators";

const mapStateToProps = ({ attendees }) => ({ attendees });

const mergeProps = ({ attendees }, {}, { seat, previewPlacement }) => {
  const attendee = attendees.find(attendee => attendee.atendeeId === seat.atendeeId);
  
  return {
    attendee,
    seat,
    previewPlacement
  };
};

const SeatContainer = connect(mapStateToProps, null, mergeProps)(Seat);

export default SeatContainer