import { Component } from "react";
import { DropTarget } from "react-dnd";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import AssignedAttendee from "./assigned-attendee";
import { defaultDropCollect } from "../../common/dnd-defaults";

import { 
  ASSIGNED_ATTENDEE, 
  ATTENDEE_LIST_ITEM 
} from "../item-types";

import { 
  COXSWAIN, 
  PORT_ROWER, 
  STARBOARD_ROWER, 
  BISWEPTUAL_ROWER 
} from "../models/attendee-positions";

import { assignAttendee, unassignAttendee } from "../action-creators";
import { RACE_MODE } from "../models/event-modes";

export const mapStateToProps = state => ({
  canAttendeeOccupyMultipleBoats: state.eventDetails.mode === RACE_MODE 
});

export const mapDispatchToProps = dispatch => bindActionCreators({ assignAttendee, unassignAttendee }, dispatch);

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
    
    const isMoveWithinBoat = targetBoatId == originBoatId;
    const isSameSeat = targetSeatNumber == originSeatNumber && isMoveWithinBoat;
      
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

@connect(mapStateToProps, mapDispatchToProps)
@DropTarget([ATTENDEE_LIST_ITEM, ASSIGNED_ATTENDEE], dropSpec, defaultDropCollect)
export default class Seat extends Component {
  render() {
    const { 
      connectDropTarget, 
      attendeeId, 
      boatId, 
      seatNumber, 
      attendeeIdsInBoat 
    } = this.props;

    const isCoxSeat = seatNumber === 0;
    const isPort = seatNumber % 2;
    
    const label = isCoxSeat ? "C" : seatNumber;
    
    const getAcceptedPositions = () => {
      if (isCoxSeat) {
        return [COXSWAIN];
      }
      
      if (isPort) {
        return [PORT_ROWER, BISWEPTUAL_ROWER];
      }
      
      return [STARBOARD_ROWER, BISWEPTUAL_ROWER];
    };
     
    const assignAttendeeContainer = attendeeId 
      ? <AssignedAttendee attendeeId={attendeeId} boatId={boatId} 
          seatNumber={seatNumber} attendeeIdsInBoat={attendeeIdsInBoat}
          acceptedPositions={getAcceptedPositions()} />
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