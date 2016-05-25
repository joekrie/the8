import { List } from "immutable";

import Seat, { attendeeListItemDropSpec, assignedAttendeeDropSpec } from "../seat"; 

describe("<Seat />", () => {
  describe("attendeeListItemDropSpec", () => {
    it("allows drop when dragged attendee not already in boat", () => {
      const attendeeIdsInBoat = List([ "boat-1" ]);
      const draggedAttendeeId = "boat-2";
      
      const monitor = {
        getItem: () => ({ draggedAttendeeId })
      };
      
      const canDrop = attendeeListItemDropSpec.canDrop({ attendeeIdsInBoat }, monitor);
      expect(canDrop).toBe(true);
    });
    
    it("disallows drop when dragged attendee is already in boat", () => {
      const attendeeIdsInBoat = List([ "boat-1" ]);
      const draggedAttendeeId = "boat-1";
      
      const monitor = {
        getItem: () => ({ draggedAttendeeId })
      };
      
      const canDrop = attendeeListItemDropSpec.canDrop({ attendeeIdsInBoat }, monitor);
      expect(canDrop).toBe(false);
    });
  });
});