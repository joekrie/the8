import { Record } from "immutable";
import SeatInfoRecord from "../models/seat-info";

const AssignAttendeeToSeatRecord = Record({
    seatInfo: new SeatInfoRecord(),
    attendeeId: ""
});

export default AssignAttendeeToSeatRecord