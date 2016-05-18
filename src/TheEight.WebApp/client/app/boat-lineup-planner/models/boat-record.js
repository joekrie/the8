import { Record, Map, OrderedMap } from "immutable";

import SeatRecord from "./seat";
import BoatInfoRecord from "./boat-info";

const defaults = {
    details: new BoatDetailsRecord(),
    assignedSeats: Map()
};

class BoatRecord extends Record(defaults) {
  isAttendeeInBoat(attendeeId) {
    return this.assignedSeats.contains(attendeeId);
  }
  
  isSeatAssigned(seatNumber) {
    return this.assignedSeats.has(seatNumber);
  }
  
  get allSeats() {
    const kvps = this.details.seatNumbers.map(num => [num, this.assignedSeats.get(num)]);
    return OrderedMap(kvps);
  }
  
  get attendeeIdsInBoat() {
    return this.assignedSeats.map(attendeeId => attendeeId);
  }
}

export default BoatRecord