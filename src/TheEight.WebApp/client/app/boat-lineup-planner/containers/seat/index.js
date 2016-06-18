import classNames from "classnames";
import { Component } from "react";
import { DropTarget } from "react-dnd";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import AssignedAttendee from "../assigned-attendee";
import { dropSpec, dropCollect } from "./dnd";

import { 
  ASSIGNED_ATTENDEE, 
  ATTENDEE_LIST_ITEM 
} from "../../item-types";

import { 
  COXSWAIN, 
  PORT_ROWER, 
  STARBOARD_ROWER, 
  BISWEPTUAL_ROWER 
} from "../../models/attendee-positions";

import { assignAttendee, unassignAttendee } from "../../action-creators";
import { RACE_MODE } from "../../models/event-modes";

import "./styles.scss"

export const mapStateToProps = state => ({
  canAttendeeOccupyMultipleBoats: state.eventDetails.mode === RACE_MODE 
});

export const mapDispatchToProps = dispatch => bindActionCreators({ assignAttendee, unassignAttendee }, dispatch);

@connect(mapStateToProps, mapDispatchToProps)
@DropTarget([ATTENDEE_LIST_ITEM, ASSIGNED_ATTENDEE], dropSpec, dropCollect)
export default class Seat extends Component {
  render() {
    const { 
      connectDropTarget, 
      attendeeId, 
      boatId, 
      seatNumber, 
      attendeeIdsInBoat,
      isOver
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

    const getPlaceholderStyles = () =>
      isOver ? { backgroundColor: "lightgrey" } : {};
    
    const attendeeSlot = attendeeId 
      ? <AssignedAttendee attendeeId={attendeeId} boatId={boatId} 
          seatNumber={seatNumber} attendeeIdsInBoat={attendeeIdsInBoat}
          acceptedPositions={getAcceptedPositions()} />
      : <div className={classNames("card", "placeholder")} style={getPlaceholderStyles()}></div>;

    return connectDropTarget(
      <div className="seat">
        <div className="seat-num">
          {label}
        </div>
        {attendeeSlot}
      </div>
    );
  }
}