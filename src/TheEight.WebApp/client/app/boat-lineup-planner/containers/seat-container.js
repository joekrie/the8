import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import Seat from "../components/seat";
import { assignAttendee, unassignAttendee } from "../action-creators";

const mapDispatchToProps = dispatch => bindActionCreators({ assignAttendee, unassignAttendee }, dispatch);

const SeatContainer = connect(null, mapDispatchToProps)(Seat);
export default SeatContainer