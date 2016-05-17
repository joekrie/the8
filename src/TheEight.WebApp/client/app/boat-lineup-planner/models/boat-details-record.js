import { Record, List } from "immutable";
import { range } from "lodash";

import SeatInfoRecord from "./seat-info";

const defaults = {
  boatId: "",
  title: "",
  isCoxed: false,
  seatCount: 0
};

class BoatInfoRecord extends Record(defaults) {
  get seatNumbers() {
    const seatNums = range(this.isCoxed ? 0 : 1, this.seatCount + 1);
    return List(seatNums);
  }

  get seats() {
    return this.seatNumbers.map(num =>
      new SeatInfoRecord({
        boatId: this.boatId,
        seatNumber: num
      })
    );
  }
}

export default BoatInfoRecord