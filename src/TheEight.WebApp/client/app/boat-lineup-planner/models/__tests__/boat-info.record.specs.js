import { List, Map } from "immutable";

import BoatInfoRecord from "../boat-info.record";
import SeatRecord from "../seat.record";
import SeatInfoRecord from "../seat-info.record";

describe("BoatInfoRecord", () => {
  describe("seatNumbers", () => {
    it("lists seat numbers in a coxed boat", () => {
      const boatInfo = new BoatInfoRecord({
        isCoxed: true,
        seatCount: 4
      });

      const expected = List([0, 1, 2, 3, 4]);
      expect(boatInfo.seatNumbers.equals(expected)).toBe(true);
    })
    
    it("lists seat numbers in an uncoxed boat", () => {
      const boatInfo = new BoatInfoRecord({
        isCoxed: false,
        seatCount: 2
      });

      const expectedSeats = List([1, 2]);
      expect(boatInfo.seatNumbers.equals(expectedSeats)).toBe(true);
    })
  });
  
  describe("seats", () =>  {
    it("lists seats in a coxed boat", () => {
      const boatInfo = new BoatInfoRecord({
        isCoxed: true,
        seatCount: 4
      });

      const expectedSeats = List([
        new SeatInfoRecord({ seatNumber: 0 }),
        new SeatInfoRecord({ seatNumber: 1 }),
        new SeatInfoRecord({ seatNumber: 2 }),
        new SeatInfoRecord({ seatNumber: 3 }),
        new SeatInfoRecord({ seatNumber: 4 })
      ]);

      expect(boatInfo.seats.equals(expectedSeats)).toBe(true);
    });

    it("lists seats in a uncoxed boat", () => {
      const boatInfo = new BoatInfoRecord({
        isCoxed: false,
        seatCount: 2
      });

      const expectedSeats = List([
        new SeatInfoRecord({ seatNumber: 1 }),
        new SeatInfoRecord({ seatNumber: 2 })
      ]);

      expect(boatInfo.seats.equals(expectedSeats)).toBe(true);
    });
  });
});