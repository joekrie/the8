import { Record, Map, List } from "immutable";

import SeatRecord from "./seat";
import BoatInfoRecord from "./boat-info";

const defaults = {
    boatInfo: new BoatInfoRecord(),
    assignedSeats: Map()
};

class BoatRecord extends Record(defaults) {
  isAttendeeInBoat(attendeeId) {
    return this.assignedSeats.contains(attendeeId);
  }
  
  isSeatAssigned(seatNumber) {
    return this.assignedSeats.has(seatNumber);
  }

  get seats() {
    return this.assignedSeats.map((attendeeId, seatNumber) =>
      new SeatRecord({
        attendeeId,
        seatInfo: new SeatInfoRecord({
          boatId: this.boatInfo.boatId,
          seatNumber
        })
      })
    );
  }
  
  get assignedAttendeeIds() {
    return this.assignedSeats.map(attendeeId => attendeeId);
  }
}

export default BoatRecord