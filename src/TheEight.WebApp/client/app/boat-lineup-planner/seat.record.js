import { Record } from "immutable";

import SeatInfoRecord from "./seat-info.record";

const defaults = {
    attendeeId: "",
    seat: SeatInfoRecord()
};

class SeatRecord extends Record(defaults) {
    get isOccupied() {
        return Boolean(this.attendeeId);
    }
}

export default SeatRecord