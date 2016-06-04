import { Component } from "react";

import SeatContainer from "../containers/seat-container";

export default class SeatList extends Component {
  render() {
    const { seats, attendeeIdsInBoat, boatId } = this.props;

    const boatSeats = seats.map((attendeeId, seatNumber) => (
      <SeatContainer key={seatNumber} boatId={boatId} seatNumber={seatNumber} 
        attendeeId={attendeeId} attendeeIdsInBoat={attendeeIdsInBoat} />
    ));

    return (
      <div>
        {boatSeats}
      </div>
    );
  }
}