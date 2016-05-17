import { Record } from "immutable";

const defaults = {
  boatId: "",
  seatNumber: 0,
  isInBoat: true
};

class SeatInfoRecord extends Record(defaults) {
  static createRowerSeat(boatId, seatNumber) {
    return new SeatInfoRecord({
      boatId,
      seatNumber,
      isInBoat: true
    });
  }
  
  static createCoxswainSeat(boatId) {
    return new SeatInfoRecord({
      boatId,
      seatNumber: 0,
      isInBoat: true
    });
  }
  
  static createUnassignedSeat() {
    return new SeatInfoRecord({
      isInBoat: false
    });
  }
  
  get isCoxswain() {
    return this.isInBoat && this.seatNumber === 0;
  }
  
  get isUnassigned() {
    return !this.isInBoat
  }
}

export default SeatInfoRecord