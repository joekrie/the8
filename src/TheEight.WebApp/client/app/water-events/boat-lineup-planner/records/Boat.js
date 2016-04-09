import { Record, Map } from "Immutable";

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
}