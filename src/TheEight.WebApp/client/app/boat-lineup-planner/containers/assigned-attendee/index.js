import { Component } from "react";
import { DragSource } from "react-dnd";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { defaultDragCollect } from "common/dnd-defaults";
import { ASSIGNED_ATTENDEE } from "boat-lineup-planner/item-types";
import Attendee from "boat-lineup-planner/components/attendee";

export const mapStateToProps = ({ attendees }, { attendeeId }) => {
  const attendee = attendees.find(attendee => attendee.attendeeId === attendeeId);
  return { attendee };
};

const dragSpec = {
  beginDrag(props) { 
    const { boatId, seatNumber, attendee, attendeeIdsInBoat } = props;
    
    return {
      originBoatId: boatId,
      originSeatNumber: seatNumber,
      draggedAttendeeId: attendee.attendeeId,
      attendeeIdsInOriginBoat: attendeeIdsInBoat,
      draggedAttendeeName: attendee.displayName
    }
  }
};

@connect(mapStateToProps)
@DragSource(ASSIGNED_ATTENDEE, dragSpec, defaultDragCollect)
export default class AssignedAttendee extends Component {
  render() {
    const { attendee, connectDragSource, acceptedPositions } = this.props;
    
    const isOutOfPosition = !acceptedPositions.includes(attendee.position);
    
    const styles = {
      "marginBottom": "10px"
    };

    return connectDragSource(
      <div style={styles}>
        <Attendee attendee={attendee} isOutOfPosition={isOutOfPosition} />
      </div>
    );
  }
}