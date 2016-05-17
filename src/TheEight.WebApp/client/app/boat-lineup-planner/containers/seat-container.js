import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import Seat from "../components/seat";
import { assignAttendeeToSeat, unassignAttendeeInSeat } from "../action-creators";

const mapDispatchToProps = dispatch => bindActionCreators({ assignAttendeeToSeat, unassignAttendeeInSeat }, dispatch);

export default SeatContainer = connect(null, mapDispatchToProps)(Seat);