import Radium from "radium";
import { Component } from "react";
import { DropTarget } from "react-dnd";

import AssignedAttendeeContainer from "../containers/assigned-attendee-container";
import { defaultDropCollect } from "../../common/dnd-defaults";
import * as ItemTypes from "../item-types";

export const dropSpec = {
  canDrop(props, monitor) {
    const { attendeeIdsInBoat, boatId: targetBoatId } = props;
    const itemType = monitor.getItemType();
    const { draggedAttendeeId, originBoatId } = monitor.getItem();
    
    const alreadyInBoat = attendeeIdsInBoat.contains(draggedAttendeeId);
    
    if (itemType === ItemTypes.ATTENDEE_LIST_ITEM) {
      return !alreadyInBoat;
    }
    
    if (itemType === ItemTypes.ASSIGNED_ATTENDEE) {      
      const isMoveWithinBoat = targetBoatId == originBoatId;
      return isMoveWithinBoat || !alreadyInBoat;
    }
  },
  drop(props, monitor) {
    const { assignAttendee, seatNumber: targetSeatNumber, boatId: targetBoatId, attendeeId: attendeeIdInTarget } = props;
    const itemType = monitor.getItemType();
    const { draggedAttendeeId, originSeatNumber, originBoatId } = monitor.getItem();
        
    if (itemType === ItemTypes.ATTENDEE_LIST_ITEM) {
      assignAttendee(draggedAttendeeId, targetBoatId, targetSeatNumber);
    }
    
    if (itemType === ItemTypes.ASSIGNED_ATTENDEE) {      
      assignAttendee(draggedAttendeeId, targetBoatId, targetSeatNumber);
      
      if (attendeeIdInTarget) {
        assignAttendee(attendeeIdInTarget, originBoatId, originSeatNumber);
      }
    }
  }
};

@Radium
@DropTarget([ItemTypes.ATTENDEE_LIST_ITEM, ItemTypes.ASSIGNED_ATTENDEE], dropSpec, defaultDropCollect)
export default class Seat extends Component {
  render() {
    const { connectDropTarget, attendeeId, boatId, seatNumber } = this.props;

    const coxswainLabel = "COX";
    const label = seatNumber === 0 ? coxswainLabel : seatNumber;
     
    const assignAttendeeContainer = attendeeId 
      ? <AssignedAttendeeContainer attendeeId={attendeeId} boatId={boatId} 
          seatNumber={seatNumber} />
      : null;
         
    const styles = {
      root: {
        "height": "50px",
        "clear": "both"
      },
      label: {
        "float": "left",
        "height": "50px",
        "lineHeight": "50px",
        "whiteSpace": "nowrap",
        "marginLeft": "10px",
        "width": "30px"
      }
    };

    return connectDropTarget(
      <div style={styles.root}>
        <div style={styles.label}>
          {label}
        </div>
        {assignAttendeeContainer}
      </div>
    );
  }
}