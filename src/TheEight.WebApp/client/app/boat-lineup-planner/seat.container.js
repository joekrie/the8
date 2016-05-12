import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import Seat from "./seat.component";
import { placeAttendees } from "./action-creators";

const mapDispatchToProps = dispatch => bindActionCreators({ placeAttendees }, dispatch);
const SeatContainer = connect(null, mapDispatchToProps)(Seat);

export default SeatContainer