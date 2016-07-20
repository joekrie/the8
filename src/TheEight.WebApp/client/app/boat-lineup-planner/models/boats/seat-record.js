import { Record } from "immutable";

const defaults = {
  seatNumber: 0,
  attendeeId: ""
};

class SeatRecord extends Record(defaults) {  
  get isCoxswain() {
    return this.isInBoat && this.seatNumber === 0;
  }
  
  get hasAttendee() {
    return Boolean(this.attendeeId);
  }
}

export default SeatRecord