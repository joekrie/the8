import { Map } from "immutable";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import BoatListComponent from "./boat-list.component";
import { placeAttendees } from "./action-creators";

const styles = {
    root: {
        "marginTop": "0",
        "marginBottom": "0",
        "display": "flex"
    }
};

const mapStateToProps = ({ boats, attendees }) => {
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

const mapDispatchToProps = dispatch => 
    bindActionCreators({ placeAttendees }, dispatch);

const BoatListContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(BoatListComponent);

export { mapStateToProps, mapDispatchToProps }
export default BoatListContainer