import { Record } from "immutable";
import SeatInfoRecord from "../models/seat-info";

const UnassignAttendeeInSeatRecord = Record({
    seatInfo: new SeatInfoRecord()
});

export default UnassignAttendeeInSeatRecord