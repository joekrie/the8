import { Map } from "immutable";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import BoatList from "./boat-list.component";
import { placeAttendees } from "./action-creators";

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

const BoatListContainer = connect(mapStateToProps)(BoatList);

export { mapStateToProps }
export default BoatListContainer