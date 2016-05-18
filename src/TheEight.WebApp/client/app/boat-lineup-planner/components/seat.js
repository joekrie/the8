import Radium from "radium";
import { Component } from "react";
import { DropTarget } from "react-dnd";

import Attendee from "./attendee";
import { defaultDropCollect } from "../../common/dnd-defaults";
import * as ItemTypes from "../item-types";

export const attendeeListItemDropSpec = {
  canDrop: ({ attendeeIdsInBoat }, monitor) => {
    const { draggedAttendeeId } = monitor.getItem();
    const alreadyInBoat = attendeeIdsInBoat.contains(draggedAttendeeId);
    return !alreadyInBoat;
  },
    drop: ({ assignAttendee, seat }, monitor) => {
    const { draggedAttendeeId } = monitor.getItem();
    assignAttendee(draggedAttendeeId, seat.seatDetails);
  }
};

export const assignedAttendeeDropSpec = {
  canDrop: ({ attendeeIdsInBoat, seatNumber: targetSeatNumber, boatId: targetBoatId }, monitor) => {
    const { draggedAttendeeId, originBoatId } = monitor.getItem();
    const isMoveWithinBoat = targetBoatId == originBoatId;
    const alreadyInBoat = attendeeIdsInBoat.contains(draggedAttendeeId);
    return isMoveWithinBoat || !alreadyInBoat;
  },
  drop: ({ assignAttendee, unassignAttendee, seat: targetSeat, boatId: targetBoatId, attendeeId: attendeeIdInTarget }, monitor) => {
    const { draggedAttendeeId, originSeatNumber, originBoatId } = monitor.getItem();
    const isMoveWithinBoat = targetBoatId == originBboatId;
    assignAttendee(draggedAttendeeId, targetBoatId, targetSeatNumber);
    
    if (attendeeInTarget) {
      assignAttendee(attendeeIdInTarget, originBoatId, originSeatNumber);
    }
  }
};

@Radium
@DropTarget(ItemTypes.ASSIGNED_ATTENDEE, assignedAttendeeDropSpec, defaultDropCollect)
@DropTarget(ItemTypes.ATTENDEE_LIST_ITEM, attendeeListItemDropSpec, defaultDropCollect)
export default class Seat extends Component {
  render() {
    const { connectDropTarget, attendeeId, boatId, seatNumber } = this.props;
    
    const coxswainLabel = "COX";
    const label = seatNumber === 0 ? coxswainLabel : seatNumber;
    
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
        <Attendee attendeeId={attendeeId} boatId={boatId} seatNumber={seatNumber} />
      </div>
    );
  }
}