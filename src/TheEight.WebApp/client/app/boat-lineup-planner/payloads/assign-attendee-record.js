import { Record } from "immutable";
import SeatInfoRecord from "../models/seat-info";

const AssignAttendeeRecord = Record({
    seatInfo: new SeatInfoRecord(),
    attendeeId: ""
});

export default AssignAttendeeRecord