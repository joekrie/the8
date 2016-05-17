import { Record } from "immutable";
import SeatInfoRecord from "../models/seat-info";

const UnassignAttendeeRecord = Record({
    seatInfo: new SeatInfoRecord()
});

export default UnassignAttendeeRecord