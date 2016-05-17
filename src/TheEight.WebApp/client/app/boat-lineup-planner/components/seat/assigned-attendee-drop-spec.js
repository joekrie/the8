export const canDrop = ({ attendeeIdsInBoat, seat: targetSeat }, monitor) => {
  const { draggedAttendeeId, originSeat } = monitor.getItem();
  const isMoveWithinBoat = targetSeat.boatId == originSeat.boatId;
  const alreadyInBoat = attendeeIdsInBoat.contains(draggedAttendeeId);
  return isMoveWithinBoat || !alreadyInBoat;
};

export const drop = ({ assignAttendee, unassignAttendee, seat: targetSeat, attendee: attendeeInTarget }, monitor) => {
  const { draggedAttendeeId, originSeat } = monitor.getItem();
  const isMoveWithinBoat = targetSeat.boatId == originSeat.boatId;
  
  if (isMoveWithinBoat) {
    assignAttendee(draggedAttendeeId, targetSeat);
    assignAttendee(attendeeInTarget.attendeeId, originSeat);
  } else {
    
  }
};

