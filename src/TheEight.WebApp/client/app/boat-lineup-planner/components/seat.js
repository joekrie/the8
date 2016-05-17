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
  canDrop: ({ attendeeIdsInBoat, seat: targetSeat }, monitor) => {
    const { draggedAttendeeId, originSeat } = monitor.getItem();
    const isMoveWithinBoat = targetSeat.boatId == originSeat.boatId;
    const alreadyInBoat = attendeeIdsInBoat.contains(draggedAttendeeId);
    return isMoveWithinBoat || !alreadyInBoat;
  },
  drop: ({ assignAttendee, unassignAttendee, seat: targetSeat, attendee: attendeeInTarget }, monitor) => {
    const { draggedAttendeeId, originSeat } = monitor.getItem();
    const isMoveWithinBoat = targetSeat.boatId == originSeat.boatId;
    assignAttendee(draggedAttendeeId, targetSeat);
    
    if (attendeeInTarget) {
      assignAttendee(attendeeInTarget.attendeeId, originSeat);
    }
  }
};

@Radium
@DropTarget(ItemTypes.ASSIGNED_ATTENDEE, assignedAttendeeDropSpec, defaultDropCollect)
@DropTarget(ItemTypes.ATTENDEE_LIST_ITEM, attendeeListItemDropSpec, defaultDropCollect)
export default class Seat extends Component {
  render() {
    const { connectDropTarget, attendee, seat: { seatInfo: { seatNumber }, isOccupied } } = this.props;
    const attendeeComponent = isOccupied ? <Attendee attendee={attendee} seatInfo={seatInfo} /> : null;
    
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
        {attendeeComponent}
      </div>
    );
  }
}