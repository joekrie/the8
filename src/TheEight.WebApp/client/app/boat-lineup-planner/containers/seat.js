import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import Seat from "../../components/seat";
import previewAssignment from "./preview-assignment";

const mapStateToProps = ({ attendees }) => ({ attendees });

const mergeProps = ({ attendees }, {}, { seat, previewPlacement }) => {
  const attendee = attendees.find(attendee => attendee.atendeeId === seat.atendeeId);
  
  const previewAssignment = (originSeat, targetSeatInfo, { onAssignAttendeeToSeat, onUnassignAttendeeInSeat }) => {
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
  };
  
  return {
    attendee,
    seat,
    previewPlacement
  };
};

const SeatContainer = connect(mapStateToProps, null, mergeProps)(Seat);

export default SeatContainer