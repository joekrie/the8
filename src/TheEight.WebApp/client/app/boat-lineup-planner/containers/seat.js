import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import Seat from "../components/seat";
import { placeAttendees } from "../action-creators";

const mapStateToProps = ({ attendees }) => ({ attendees });
const mapDispatchToProps = dispatch => bindActionCreators({ placeAttendees }, dispatch);

const mergeProps = ({ attendees }, { placeAttendees }, { seat, previewPlacement }) => {
  const attendee = attendees.find(attendee => attendee.atendeeId === seat.atendeeId);
  
  return {
    attendee,
    seat,
    placeAttendees,
    previewPlacement
  };
};

const SeatContainer = connect(mapStateToProps, mapDispatchToProps, mergeProps)(Seat);

export default SeatContainer