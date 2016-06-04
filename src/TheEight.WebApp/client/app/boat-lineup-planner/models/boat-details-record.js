import { Record, List } from "immutable";
import { range } from "lodash";

const defaults = {
  boatId: "",
  title: "",
  isCoxed: false,
  seatCount: 0
};

class BoatDetailsRecord extends Record(defaults) {
  get seatNumbers() {
    const seatNums = range(this.isCoxed ? 0 : 1, this.seatCount + 1);
    return List(seatNums);
  }
}

export default BoatDetailsRecord