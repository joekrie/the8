import { Record, Map, List } from "immutable";
import { range } from "lodash";
import SeatRecord from "./SeatRecord";

const defaults = {
    boatId: "",
    title: "",
    isCoxed: false,
    seatCount: 0,
    seatAssignments: Map()
};

export default class extends Record(defaults) {
    unassignSeat(seat) {
        return this.set("seatAssignments", this.seatAssignments.delete(seat));
    }

    assignAttendee(attendeeId, seat) {
        return this.set("seatAssignments", this.seatAssignments.set(seat, attendeeId));
    }

    isAttendeeInBoat(attendeeId) {
        return this.seatAssignments.contains(attendeeId);
    }

    isSeatAssigned(seat) {
        return this.seatAssignments.has(seat);
    }

    listSeats() {
        const seatNums = range(this.isCoxed ? 0 : 1, this.seatCount + 1);

        const seatRecs = seatNums.map(num =>
            new SeatRecord({
                boatId: this.boatId,
                seatNumber: num
            }));
        
        return List(seatRecs);
    }
}