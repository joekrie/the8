import { List, Map } from "immutable";

import SeatInfoRecord from "../seat-info.record";

describe("SeatInfoRecord", () => {  
  describe("isSeatInBoat", () => {
    it("checks if seat in boat", () => {
      const seatInfo = new SeatInfoRecord({
        boatId: "boat-1"
      });
      
      expect(seatInfo.isSeatInBoat).toBe(true);
    });
    
    it("checks if seat not in boat", () => {
      const seatInfo = new SeatInfoRecord();
      expect(seatInfo.isSeatInBoat).toBe(false);
    });
  });
});