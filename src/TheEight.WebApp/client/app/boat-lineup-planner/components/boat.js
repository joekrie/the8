import Radium from "radium";
import { Component } from "react"

import SeatList from "./seat-list";
import BoatHeader from "./boat-header";
import SeatRecord from "../models/seat-record";

@Radium
export default class Boat extends Component {  
  render() {
    const { boat } = this.props;    
    const attendeeIdsInBoat = boat.assignedSeats.valueSeq().toList();
    
    const styles = {
      "width": "300px",
      "backgroundColor": "#263751",
      "display": "inline-block",
      "marginRight": "20px",
      "color": "#F5F5F5"
    };

    return (
      <div style={styles}>
        <BoatHeader boatDetails={boat.details} />
        <SeatList seats={boat.allSeats} boatId={boat.details.boatId} 
          attendeeIdsInBoat={attendeeIdsInBoat} />
      </div>
    );
  }
}