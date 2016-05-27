import { List } from "immutable";

import Seat, { attendeeListItemDropSpec, assignedAttendeeDropSpec } from "../seat"; 

describe("<Seat />", () => {
  describe("attendeeListItemDropSpec", () => {
    it("allows drop when dragged attendee not already in boat", () => {
      const monitor = { 
        getItem: () => ({
          draggedAttendeeId: "2"
        })
      };
      
      const props = { 
        attendeeIdsInBoat: List([ "1" ])
      };
      
      const canDrop = attendeeListItemDropSpec.canDrop(props, monitor);
      expect(canDrop).toBe(true);
    });
    
    it("disallows drop when dragged attendee is already in boat", () => {
      const monitor = { 
        getItem: () => ({
          draggedAttendeeId: "1"
        })
      };

      const props = { 
        attendeeIdsInBoat: List([ "1" ]) 
      };
      
      const canDrop = attendeeListItemDropSpec.canDrop(props, monitor);
      expect(canDrop).toBe(false);
    });
  });
  
  describe("assignedAttendeeDropSpec", () => {
    it("allows drop from outside boat when attendee not already in boat", () => {
      const monitor = { 
        getItem: () => ({
          draggedAttendeeId: "2",
          originBoatId: "100",
          originSeatNumber: 1
        })
      };
                 
      const props = { 
        attendeeIdsInBoat: List([ "1" ]),
        boatId: "200",
        seatNumber: 1
      };
      
      const canDrop = attendeeListItemDropSpec.canDrop(props, monitor);
      expect(canDrop).toBe(true);
    });
    
    it("disallows drop from outside boat when attendee already in boat", () => {     
      const monitor = { 
        getItem: () => ({
          draggedAttendeeId: "1",
          originBoatId: "100",
          originSeatNumber: 1
        })
      };
           
      const props = { 
        attendeeIdsInBoat: List([ "1" ]),
        boatId: "200",
        seatNumber: 1
      };
      
      const canDrop = assignedAttendeeDropSpec.canDrop(props, monitor);
      expect(canDrop).toBe(false);
    });
    
    it("allows move within boat", () => {
      const monitor = { 
        getItem: () => ({
          draggedAttendeeId: "1",
          originBoatId: "100",
          originSeatNumber: 1
        })
      };
            
      const props = { 
        attendeeIdsInBoat: List([ "1" ]),
        boatId: "100",
        seatNumber: 1
      };
      
      const canDrop = assignedAttendeeDropSpec.canDrop(props, monitor);
      expect(canDrop).toBe(true);
    });
    
    it("assigns dragged attendee to unoccupied seat", () => {
      const monitor = { 
        getItem: () => ({
          draggedAttendeeId: "1",
          originBoatId: "200",
          originSeatNumber: 2
        })
      };
      
      const assignAttendee = jest.fn();
            
      const props = { 
        attendeeIdsInBoat: List([ "1" ]),
        boatId: "100",
        seatNumber: 1,
        attendeeId: undefined,
        assignAttendee
      };
            
      assignedAttendeeDropSpec.drop(props, monitor);     
      
      expect(assignAttendee.mock.calls.length).toBe(1);
      
      // assigns dragged attendee to target seat
      expect(assignAttendee.mock.calls[0][0]).toBe("1");
      expect(assignAttendee.mock.calls[0][1]).toBe("100");
      expect(assignAttendee.mock.calls[0][2]).toBe(1);
    });
    
    it("swaps assigned attendees in different boats", () => {
      const monitor = { 
        getItem: () => ({
          draggedAttendeeId: "1",
          originBoatId: "200",
          originSeatNumber: 2
        })
      };
      
      const assignAttendee = jest.fn();
            
      const props = { 
        attendeeIdsInBoat: List([ "1" ]),
        boatId: "100",
        seatNumber: 1,
        attendeeId: "2",
        assignAttendee
      };
            
      assignedAttendeeDropSpec.drop(props, monitor);     
      
      expect(assignAttendee.mock.calls.length).toBe(2);
      
      // assign dropped attendee to target seat
      expect(assignAttendee.mock.calls[0][0]).toBe("1");
      expect(assignAttendee.mock.calls[0][1]).toBe("100");
      expect(assignAttendee.mock.calls[0][2]).toBe(1);
      
      // assign attendee in target to origin
      expect(assignAttendee.mock.calls[1][0]).toBe("2");
      expect(assignAttendee.mock.calls[1][1]).toBe("200");
      expect(assignAttendee.mock.calls[1][2]).toBe(2);
    });
    
    it("swaps assigned attendees within boat", () => {
      const monitor = { 
        getItem: () => ({
          draggedAttendeeId: "1",
          originBoatId: "100",
          originSeatNumber: 2
        })
      };
      
      const assignAttendee = jest.fn();
            
      const props = { 
        attendeeIdsInBoat: List([ "1" ]),
        boatId: "100",
        seatNumber: 1,
        attendeeId: "2",
        assignAttendee
      };
            
      assignedAttendeeDropSpec.drop(props, monitor);     
      
      expect(assignAttendee.mock.calls.length).toBe(2);
      
      // assign dropped attendee to target seat
      expect(assignAttendee.mock.calls[0][0]).toBe("1");
      expect(assignAttendee.mock.calls[0][1]).toBe("100");
      expect(assignAttendee.mock.calls[0][2]).toBe(1);
      
      // assign attendee in target to origin
      expect(assignAttendee.mock.calls[1][0]).toBe("2");
      expect(assignAttendee.mock.calls[1][1]).toBe("100");
      expect(assignAttendee.mock.calls[1][2]).toBe(2);
    });
  });
});