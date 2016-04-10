import { Record, Map } from "immutable";
import { range } from "lodash";

const defaults = {
    boatId: "",
    title: "",
    isCoxed: false,
    seatCount: 0,
    seatAssignments: Map()
};

export default class extends Record(defaults) {
    unassignSeat(position) {
        return this.set("seatAssignments", this.seatAssignments.delete(position));
    }

    assignAttendee(position, attendeeId) {
        return this.set("seatAssignments", this.seatAssignments.set(position, attendeeId));
    }

    isAttendeeInBoat(attendeeId) {
        return this.seatAssignments.contains(attendeeId);
    }

    isSeatAssigned(position) {
        return this.seatAssignments.has(position);
    }

    getSeats() {
        return range(this.isCoxed ? 0 : 1, this.seatCount + 1)
            .map(n => String(n));
    }
}