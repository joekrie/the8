import Radium from "radium";
import { Component } from "react"

import BoatSeatList from "./boat-seat-list";
import BoatHeader from "./boat-header";
import SeatRecord from "../models/seat";

@Radium
class Boat extends Component {
  previewPlacement(originSeat, targetSeatInfo) {
    const { boat: { boatInfo, assignedSeats, seats, isAttendeeInBoat } } = this.props;
    
    const droppedAttendeeId = originSeat.attendeeId;
    const isMoveWithinBoat = originSeat.seatInfo.boatId === targetSeat.boatId;
    const isAttendeeAlreadyInBoat = isAttendeeInBoat(droppedAttendeeId);
    const isSameSeat = originSeat.seatInfo.equals(targetSeatInfo);
    const isAllowed = !isSameSeat && (isMoveWithinBoat || !isAttendeeAlreadyInBoat);

    const actionPayload = new PlaceAttendeesPayloadRecord({ isAllowed });
    
    if (!isAllowed) {
      return actionPayload;
    }
    
    const assignAttendeeInTargetToOrigin = () => {
      const attendeeInTargetSeat = assignedSeats.get(targetSeatInfo.seatNumber);      
      
      actionPayload.assignments.push(
        new SeatRecord({
          attendeeId: attendeeInTargetSeat,
          seat: originSeat
        })
      );
    };

    const assignDroppedAttendeeToTarget = () => {
      actionPayload.assignments.push(
        new SeatRecord({
          attendeeId: droppedAttendeeId,
          seatInfo: targetSeatInfo
        })
      );
    };

    const unassignTarget = () => {
      actionPayload.unassignments.push(targetSeatInfo);
    };

    const wasDraggedAssigned = Boolean(draggedOriginSeat);
    const isTargetSeatOpen = boat.seatAssignments.has(targetSeat.seatNumber);
    const isSwapWithAssigned = wasDraggedAssigned && !isTargetSeatOpen;
    
    if (isSwapWithAssigned) {
      assignAttendeeInTargetToOrigin();
      assignDroppedAttendeeToTarget();
      return actionPayload;
    }
    
    const isSwapWithUnassigned = !wasDraggedAssigned && !isTargetSeatOpen;
    const isMoveWithinBoatToOpenSeat = isMoveWithinBoat && isTargetSeatOpen;

    if (isSwapWithUnassigned || isMoveWithinBoatToOpenSeat) {
      unassignTarget();
      assignDroppedAttendeeToTarget();
      return actionPayload;
    }

    const isOutsideBoatToOpenSeat = !isMoveWithinBoat && isTargetSeatOpen;
    
    if (isOutsideBoatToOpenSeat) {
      assignDroppedAttendeeToTarget();
    }

    return actionPayload;
  }
  
  render() {
    const { boat: { boatInfo, seats } } = this.props;
    
    const styles = {
      "width": "300px",
      "backgroundColor": "#263751",
      "display": "inline-block",
      "marginRight": "20px",
      "color": "#F5F5F5"
    };

    return (
      <div style={styles}>
        <BoatHeader boatInfo={boatInfo} />
        <BoatSeatList seats={seats} previewPlacement={this.previewPlacement} />
      </div>
    );
  }
}

export default Boat