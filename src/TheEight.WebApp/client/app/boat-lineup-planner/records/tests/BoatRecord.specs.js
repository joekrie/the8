import BoatRecord from "../BoatRecord";
import { List, Map } from "immutable";

describe("BoatRecord", () => {
    it("unassigns attendee at seat", () => {
        const boat = new BoatRecord({
            seatAssignments: Map([
                [1, "rower-1"]
            ])
        });

        const newBoat = boat.unassignSeat(1);
        const seat1 = newBoat.seatAssignments.get(1);
        expect(seat1).not.toBeDefined();
    });

    it("assigns attendee to seat", () => {
        const boat = new BoatRecord();
        const newBoat = boat.assignAttendee("rower-1", 1);
        const seat1 = newBoat.seatAssignments.get(1);
        expect(seat1).toBe("rower-1");
    });
    
    it("checks if attendee is in boat", () => {
        const boat = new BoatRecord({
            seatAssignments: Map([
                [1, "rower-1"]
            ])
        });

        const rower1InBoat = boat.isAttendeeInBoat("rower-1");
        const rower2InBoat = boat.isAttendeeInBoat("rower-2");

        expect(rower1InBoat).toBe(true);
        expect(rower2InBoat).toBe(false);
    });

    it("checks if seat is assigned", () => {
        const boat = new BoatRecord({
            seatAssignments: Map([
                [1, "rower-1"]
            ])
        });

        const seat1Assigned = boat.isSeatAssigned(1);
        const seat2Assigned = boat.isSeatAssigned(2);

        expect(seat1Assigned).toBe(true);
        expect(seat2Assigned).toBe(false);
    });

    it("lists seats in a coxed boat", () => {
        const boat = new BoatRecord({
            isCoxed: true,
            seatCount: 2
        });

        const seats = boat.listSeats();
        const expectedSeats = List([0, 1, 2]);
        expect(seats.equals(expectedSeats)).toBe(true);
    });

    it("lists seats in a uncoxed boat", () => {
        const boat = new BoatRecord({
            isCoxed: false,
            seatCount: 2
        });

        const seats = boat.listSeats();
        const expectedSeats = List([1, 2]);
        expect(seats.equals(expectedSeats)).toBe(true);
    });
});