import { 
  ASSIGNED_ATTENDEE, 
  ATTENDEE_LIST_ITEM 
} from "boat-lineup-planner/item-types";

import { 
  COXSWAIN, 
  PORT_ROWER, 
  STARBOARD_ROWER, 
  BISWEPTUAL_ROWER 
} from "boat-lineup-planner/models/attendee-positions";

import { assignAttendee, unassignAttendee } from "boat-lineup-planner/action-creators";
import { RACE_MODE } from "boat-lineup-planner/models/event-modes";

export const dropSpec = {
  canDrop(props, monitor) {
    const { 
      attendeeIdsInBoat: attendeeIdsInTargetBoat, 
      boatId: targetBoatId, 
      seatNumber: targetSeatNumber 
    } = props;
    
    const itemType = monitor.getItemType();

    const { 
      draggedAttendeeId, 
      originSeatNumber, 
      originBoatId 
    } = monitor.getItem();
    
    const alreadyInBoat = attendeeIdsInTargetBoat.contains(draggedAttendeeId);
    
    if (itemType === ATTENDEE_LIST_ITEM) {
      return !alreadyInBoat;
    }
    
    const isMoveWithinBoat = targetBoatId === originBoatId;
    const isSameSeat = targetSeatNumber === originSeatNumber && isMoveWithinBoat;
      
    return !isSameSeat && (isMoveWithinBoat || !alreadyInBoat);
  },
  drop(props, monitor) {
    const { assignAttendee, unassignAttendee } = props; 
    
    const { 
      seatNumber: targetSeatNumber, 
      boatId: targetBoatId, 
      attendeeId: attendeeIdInTarget 
    } = props;
    
    const itemType = monitor.getItemType();

    const { 
      draggedAttendeeId, 
      originSeatNumber, 
      originBoatId, 
      attendeeIdsInOriginBoat 
    } = monitor.getItem();
        
    if (itemType === ATTENDEE_LIST_ITEM) {
      assignAttendee(draggedAttendeeId, targetBoatId, targetSeatNumber);
    }
    
    if (itemType === ASSIGNED_ATTENDEE) {
      const isTargetInOrigin = attendeeIdsInOriginBoat.contains(attendeeIdInTarget);
      const isMoveWithinBoat = targetBoatId === originBoatId;
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

export const dropCollect = (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  isOverCurrent: monitor.isOver({ shallow: true }),
  canDrop: monitor.canDrop(),
  itemType: monitor.getItemType()
});