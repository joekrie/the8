import Radium from "radium";
import { Component } from "react";

import SeatContainer from "../containers/seat-container";

@Radium
export default class BoatSeatList extends Component {
  render() {
    const { seats, assignedAttendeeIds } = this.props;
    
    const boatSeats = seats.map(seat => (
      <SeatContainer key={seat.seatNumber} seat={seat} assignedAttendeeIds={assignedAttendeeIds} />
    ));

    return (
      <div>
        {boatSeats}
      </div>
    );
  }
}