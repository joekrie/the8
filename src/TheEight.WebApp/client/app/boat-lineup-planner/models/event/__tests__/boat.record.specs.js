import { List, Map } from "immutable";

import BoatRecord from "../boat.record";
import BoatInfoRecord from "../boat-info.record";
import SeatRecord from "../seat.record";

describe("BoatRecord", () => {
  describe("isAttendeeInBoat", () => {
    it("checks if attendee is in boat", () => {
      const boat = new BoatRecord({
        assignedSeats: Map([
          [1, "rower-1"]
        ])
      });

      const rower1InBoat = boat.isAttendeeInBoat("rower-1");
      const rower2InBoat = boat.isAttendeeInBoat("rower-2");

      expect(rower1InBoat).toBe(true);
      expect(rower2InBoat).toBe(false);
    });
  });

  describe("isSeatAssigned", () => {
    it("checks if seat is assigned", () => {
      const boat = new BoatRecord({
        assignedSeats: Map([
          [1, "rower-1"]
        ])
      });

      const seat1Assigned = boat.isSeatAssigned(1);
      const seat2Assigned = boat.isSeatAssigned(2);

      expect(seat1Assigned).toBe(true);
      expect(seat2Assigned).toBe(false);
    });
  });

  describe("seats", () => {
    
  });
});