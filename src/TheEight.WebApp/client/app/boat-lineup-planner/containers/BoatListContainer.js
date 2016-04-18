import BoatList from "../components/BoatList";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { createAction } from "redux-actions";
import { placeAttendees } from "../actionCreators";
import { Map } from "immutable";

export const mapStateToProps = ({ boats, attendees }) => {
    const findAttendeesInBoat = ({ seatAssignments }) => attendees
        .filter(attn => seatAssignments.contains(attn.attendeeId))
        .toList();

    const boatsWithAttendees = Map(
        boats.map(boat =>
            Map({
                boat,
                attendees: findAttendeesInBoat(boat)
            })
        )
    );

    return {
        boats: boatsWithAttendees
    };
};

export const mapDispatchToProps = dispatch => 
    bindActionCreators({ placeAttendees }, dispatch);

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(BoatList);