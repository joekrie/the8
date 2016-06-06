import { Component } from "react";
import { DragSource } from "react-dnd";

import { defaultDragCollect } from "../../common/dnd-defaults";
import { ASSIGNED_ATTENDEE } from "../item-types";
import Attendee from "./attendee";

const dragSpec = {
  beginDrag(props) { 
    const { boatId, seatNumber, attendee, attendeeIdsInBoat } = props;
    
    return {
      originBoatId: boatId,
      originSeatNumber: seatNumber,
      draggedAttendeeId: attendee.attendeeId,
      attendeeIdsInOriginBoat: attendeeIdsInBoat
    }
  }
};

@DragSource(ASSIGNED_ATTENDEE, dragSpec, defaultDragCollect)
export default class AssignedAttendee extends Component {
  render() {
    const { attendee, connectDragSource, acceptedPositions } = this.props;
    
    const isOutOfPosition = !acceptedPositions.includes(attendee.position);
    
    const styles = {
      "marginBottom": "10px",
      "padding": "10px",
      "color": "#F5F5F5",
      "cursor": "grab",
      "backgroundColor": attendee.isCoxswain ? "#304F66" : "#2A4458"
    };

    return connectDragSource(
      <div style={styles}>
        <Attendee attendee={attendee} isOutOfPosition={isOutOfPosition} />
      </div>
    );
  }
}