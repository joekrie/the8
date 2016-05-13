import Radium from "radium";
import { Component } from "react";

import SeatContainer from "./seat";

@Radium
class BoatSeatList extends Component {
  render() {
    const { seats, previewPlacement } = this.props;
    
    const boatSeats = seats.map(seat => (
      <SeatContainer key={seat.seatNumber} seat={seat}  
        previewPlacement={previewPlacement} />
    ));

    return (
      <div>
        {boatSeats}
      </div>
    );
  }
}

export default BoatSeatList