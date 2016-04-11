import { Record, Map, List } from "immutable";
import { range } from "lodash";

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
        const seats = range(this.isCoxed ? 0 : 1, this.seatCount + 1);
        return List(seats);
    }
}