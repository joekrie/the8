import { List, Map } from "immutable";

import SeatRecord from "../seat.record";
import SeatInfoRecord from "../seat-info.record";

describe("SeatRecord", () => {
  describe("isOccupied", () => {
    it("checks if occupied", () => {
      const seat = new SeatRecord({
        attendeeId: "attendee-1"
      });
      
      expect(seat.isOccupied).toBe(true);
    });
    
    it("checks if unoccupied", () => {
      const seat = new SeatRecord();      
      expect(seat.isOccupied).toBe(false);
    })
  });
});