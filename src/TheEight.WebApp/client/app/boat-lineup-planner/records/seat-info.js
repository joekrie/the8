import { Record } from "immutable";

const defaults = {
  boatId: "",
  seatNumber: 0
};

class SeatInfoRecord extends Record(defaults) {
  get isCoxswainSeat() {
    return this.seatNumber === 0;
  }

  get isSeatInBoat() {
    return Boolean(this.boatId);
  }
}

export default SeatInfoRecord