import Radium from "radium";
import { Component } from "react"

import BoatSeatList from "./boat-seat-list";
import BoatHeader from "./boat-header";
import SeatRecord from "../models/seat-record";

@Radium
export default class Boat extends Component {  
  render() {
    const { boat: { boatDetails, seats, assignedAttendeeIds } } = this.props;
    
    const styles = {
      "width": "300px",
      "backgroundColor": "#263751",
      "display": "inline-block",
      "marginRight": "20px",
      "color": "#F5F5F5"
    };

    return (
      <div style={styles}>
        <BoatHeader boatDetails={boatDetails} />
        <BoatSeatList seats={seats} assignedAttendeeIds={assignedAttendeeIds} />
      </div>
    );
  }
}