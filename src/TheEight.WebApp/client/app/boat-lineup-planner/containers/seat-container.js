import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import Seat from "../components/seat";
import { assignAttendee, unassignAttendee } from "../action-creators";
import { RACE_MODE } from "../models/event-modes";

export const mapStateToProps = state => ({
  canAttendeeOccupyMultipleBoats: state.eventDetails.mode === RACE_MODE 
});

export const mapDispatchToProps = dispatch => bindActionCreators({ assignAttendee, unassignAttendee }, dispatch);

const SeatContainer = connect(mapStateToProps, mapDispatchToProps)(Seat);
export default SeatContainer