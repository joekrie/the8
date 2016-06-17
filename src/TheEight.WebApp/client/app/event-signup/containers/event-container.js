import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import Event from "../components/event";
import { signUp } from "../action-creators";

const actionCreators = { unassignAttendee, changeEventDetails, createBoat, createAttendee };
export const mapDispatchToProps = dispatch => bindActionCreators(actionCreators, dispatch);

const EventContainer = connect(null, mapDispatchToProps)(Event);
export default EventContainer