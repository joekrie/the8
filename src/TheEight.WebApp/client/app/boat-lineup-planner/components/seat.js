import { Component } from "react";
import { DropTarget } from "react-dnd";

import AssignedAttendeeContainer from "../containers/assigned-attendee-container";
import { defaultDropCollect } from "../../common/dnd-defaults";
import { ASSIGNED_ATTENDEE, ATTENDEE_LIST_ITEM } from "../item-types";

export const dropSpec = {
  canDrop(props, monitor) {
    const { attendeeIdsInBoat: attendeeIdsInTargetBoat, boatId: targetBoatId, seatNumber: targetSeatNumber } = props;
    
    const itemType = monitor.getItemType();
    const { draggedAttendeeId, originSeatNumber, originBoatId } = monitor.getItem();
    
    const alreadyInBoat = attendeeIdsInTargetBoat.contains(draggedAttendeeId);
    
    if (itemType === ATTENDEE_LIST_ITEM) {
      return !alreadyInBoat;
    }
    
    if (itemType === ASSIGNED_ATTENDEE) {      
      const isMoveWithinBoat = targetBoatId == originBoatId;
      const isSameSeat = targetSeatNumber == originSeatNumber && isMoveWithinBoat;
      
      return !isSameSeat && (isMoveWithinBoat || !alreadyInBoat);
    }
  },
  drop(props, monitor) {
    const { assignAttendee, unassignAttendee } = props; 
    const { seatNumber: targetSeatNumber, boatId: targetBoatId, attendeeId: attendeeIdInTarget } = props;
    
    const itemType = monitor.getItemType();
    const { draggedAttendeeId, originSeatNumber, originBoatId, attendeeIdsInOriginBoat } = monitor.getItem();
        
    if (itemType === ATTENDEE_LIST_ITEM) {
      assignAttendee(draggedAttendeeId, targetBoatId, targetSeatNumber);
    }
    
    if (itemType === ASSIGNED_ATTENDEE) {
      const isTargetInOrigin = attendeeIdsInOriginBoat.contains(attendeeIdInTarget);
      const isMoveWithinBoat = targetBoatId == originBoatId;
      const isSwapWithinBoat = isMoveWithinBoat && attendeeIdInTarget;
            
      assignAttendee(draggedAttendeeId, targetBoatId, targetSeatNumber);
            
      if (isSwapWithinBoat || (!isMoveWithinBoat && attendeeIdInTarget && !isTargetInOrigin)) {
        assignAttendee(attendeeIdInTarget, originBoatId, originSeatNumber);
      }
            
      if ((!isSwapWithinBoat && isTargetInOrigin) || (isMoveWithinBoat && !attendeeIdInTarget)
          || (!isMoveWithinBoat && !attendeeIdInTarget)) {
        unassignAttendee(originBoatId, originSeatNumber);
      }
    }
  }
};

@DropTarget([ATTENDEE_LIST_ITEM, ASSIGNED_ATTENDEE], dropSpec, defaultDropCollect)
export default class Seat extends Component {
  render() {
    const { connectDropTarget, attendeeId, boatId, seatNumber, attendeeIdsInBoat } = this.props;

    const coxswainLabel = "COX";
    const label = seatNumber === 0 ? coxswainLabel : seatNumber;
     
    const assignAttendeeContainer = attendeeId 
      ? <AssignedAttendeeContainer attendeeId={attendeeId} boatId={boatId} 
          seatNumber={seatNumber} attendeeIdsInBoat={attendeeIdsInBoat} />
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