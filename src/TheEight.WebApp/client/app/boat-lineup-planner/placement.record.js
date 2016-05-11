import { Record } from "immutable";

import SeatRecord from "./seat.record";

const PlacementRecord = Record({
    attendeeId: "",
    seat: SeatRecord()
});

export default PlacementRecord