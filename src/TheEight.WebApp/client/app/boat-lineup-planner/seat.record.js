import { Record } from "immutable";

const defaults = {
    boatId: "",
    seatNumber: 0
};

class SeatRecord extends Record(defaults) {
    isCoxswainSeat() {
        return this.seatNumber === 0;
    }
}

export default SeatRecord