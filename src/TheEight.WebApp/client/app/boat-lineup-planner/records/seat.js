import { Record } from "immutable";

import SeatInfoRecord from "./seat-info";

const defaults = {
  attendeeId: "",
  seatInfo: new SeatInfoRecord()
};

class SeatRecord extends Record(defaults) {
  get isOccupied() {
    return Boolean(this.attendeeId);
  }
}

export default SeatRecord