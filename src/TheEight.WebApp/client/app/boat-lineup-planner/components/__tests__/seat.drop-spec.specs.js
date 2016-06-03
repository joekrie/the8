import { List } from "immutable";

import Seat, { dropSpec } from "../seat"; 
import { ASSIGNED_ATTENDEE, ATTENDEE_LIST_ITEM } from "../../item-types"; 

describe("<Seat />", () => {
  describe("dropSpec", () => {
    it("allows drop when dragged attendee not already in boat", () => {
      const monitor = { 
        getItem: () => ({
          draggedAttendeeId: "2"
        }),
        getItemType: () => ATTENDEE_LIST_ITEM
      };
      
      const props = { 
        attendeeIdsInBoat: List([ "1" ])
      };
      
      const canDrop = dropSpec.canDrop(props, monitor);
      expect(canDrop).toBe(true);
    });
    
    it("disallows drop when dragged attendee is already in boat", () => {
      const monitor = { 
        getItem: () => ({
          draggedAttendeeId: "1"
        }),
        getItemType: () => ATTENDEE_LIST_ITEM
      };

      const props = { 
        attendeeIdsInBoat: List([ "1" ]) 
      };
      
      const canDrop = dropSpec.canDrop(props, monitor);
      expect(canDrop).toBe(false);
    });
  
    it("allows drop from outside boat when attendee not already in boat", () => {
      const monitor = { 
        getItem: () => ({
          draggedAttendeeId: "2",
          originBoatId: "100",
          originSeatNumber: 1
        }),
        getItemType: () => ASSIGNED_ATTENDEE
      };
                 
      const props = { 
        attendeeIdsInBoat: List([ "1" ]),
        boatId: "200",
        seatNumber: 1
      };
      
      const canDrop = dropSpec.canDrop(props, monitor);
      expect(canDrop).toBe(true);
    });
    
    it("disallows drop from outside boat when attendee already in boat", () => {     
      const monitor = { 
        getItem: () => ({
          draggedAttendeeId: "1",
          originBoatId: "100",
          originSeatNumber: 1
        }),
        getItemType: () => ASSIGNED_ATTENDEE
      };
           
      const props = { 
        attendeeIdsInBoat: List([ "1" ]),
        boatId: "200",
        seatNumber: 1
      };
      
      const canDrop = dropSpec.canDrop(props, monitor);
      expect(canDrop).toBe(false);
    });
    
    it("allows move within boat", () => {
      const monitor = { 
        getItem: () => ({
          draggedAttendeeId: "1",
          originBoatId: "100",
          originSeatNumber: 1
        }),
        getItemType: () => ASSIGNED_ATTENDEE
      };
            
      const props = { 
        attendeeIdsInBoat: List([ "1" ]),
        boatId: "100",
        seatNumber: 2
      };
      
      const canDrop = dropSpec.canDrop(props, monitor);
      expect(canDrop).toBe(true);
    });
    
    
    it("disallows drop in same seat", () => {
      const monitor = { 
        getItem: () => ({
          draggedAttendeeId: "1",
          originBoatId: "100",
          originSeatNumber: 1
        }),
        getItemType: () => ASSIGNED_ATTENDEE
      };
            
      const props = { 
        attendeeIdsInBoat: List([ "1" ]),
        boatId: "100",
        seatNumber: 1
      };
      
      const canDrop = dropSpec.canDrop(props, monitor);
      expect(canDrop).toBe(false);
    });
    
    it("moves dragged attendee to unoccupied seat", () => {
      const monitor = { 
        getItem: () => ({
          draggedAttendeeId: "1",
          originBoatId: "200",
          originSeatNumber: 2,
          attendeeIdsInOriginBoat: List()
        }),
        getItemType: () => ASSIGNED_ATTENDEE
      };
      
      const assignAttendee = jest.fn();
      const unassignAttendee = jest.fn();
            
      const props = { 
        attendeeIdsInBoat: List([ "1" ]),
        boatId: "100",
        seatNumber: 1,
        attendeeId: undefined,
        assignAttendee,
        unassignAttendee
      };
            
      dropSpec.drop(props, monitor);     
      
      // assigns dragged attendee to target seat
      expect(assignAttendee.mock.calls.length).toBe(1);
      expect(assignAttendee.mock.calls[0][0]).toBe("1");
      expect(assignAttendee.mock.calls[0][1]).toBe("100");
      expect(assignAttendee.mock.calls[0][2]).toBe(1);
      
      // unassigns dragged attendee from origin seat
      expect(unassignAttendee.mock.calls.length).toBe(1);
      expect(unassignAttendee.mock.calls[0][0]).toBe("200");
      expect(unassignAttendee.mock.calls[0][1]).toBe(2);
    });
    
    it("swaps assigned attendees in different boats", () => {
      const monitor = { 
        getItem: () => ({
          draggedAttendeeId: "1",
          originBoatId: "200",
          originSeatNumber: 2,
          attendeeIdsInOriginBoat: List()
        }),
        getItemType: () => ASSIGNED_ATTENDEE
      };
      
      const assignAttendee = jest.fn();
      const unassignAttendee = jest.fn();
            
      const props = { 
        attendeeIdsInBoat: List([ "1" ]),
        boatId: "100",
        seatNumber: 1,
        attendeeId: "2",
        assignAttendee,
        unassignAttendee
      };
            
      dropSpec.drop(props, monitor);     
      
      expect(assignAttendee.mock.calls.length).toBe(2);
      
      // assign dropped attendee to target seat
      expect(assignAttendee.mock.calls[0][0]).toBe("1");
      expect(assignAttendee.mock.calls[0][1]).toBe("100");
      expect(assignAttendee.mock.calls[0][2]).toBe(1);
      
      // assign attendee in target to origin
      expect(assignAttendee.mock.calls[1][0]).toBe("2");
      expect(assignAttendee.mock.calls[1][1]).toBe("200");
      expect(assignAttendee.mock.calls[1][2]).toBe(2);
      
      // should not unassign attendees
      expect(unassignAttendee.mock.calls.length).toBe(0);
    });
        
    it("swaps assigned attendees within boat", () => {
      const monitor = { 
        getItem: () => ({
          draggedAttendeeId: "1",
          originBoatId: "100",
          originSeatNumber: 2,
          attendeeIdsInOriginBoat: List([ "1", "2" ])
        }),
        getItemType: () => ASSIGNED_ATTENDEE
      };
      
      const assignAttendee = jest.fn();
      const unassignAttendee = jest.fn();
                  
      const props = { 
        attendeeIdsInBoat: List([ "1", "2" ]),
        boatId: "100",
        seatNumber: 1,
        attendeeId: "2",
        assignAttendee,
        unassignAttendee
      };
            
      dropSpec.drop(props, monitor);
      
      expect(assignAttendee.mock.calls.length).toBe(2);
      expect(unassignAttendee.mock.calls.length).toBe(0);
      
      // assign dropped attendee to target seat
      expect(assignAttendee.mock.calls[0][0]).toBe("1");
      expect(assignAttendee.mock.calls[0][1]).toBe("100");
      expect(assignAttendee.mock.calls[0][2]).toBe(1);
      
      // assign attendee in target to origin
      expect(assignAttendee.mock.calls[1][0]).toBe("2");
      expect(assignAttendee.mock.calls[1][1]).toBe("100");
      expect(assignAttendee.mock.calls[1][2]).toBe(2);
    });
    
    it("should not assign target attendee to origin if attendee already in origin boat", () => {
      const monitor = { 
        getItem: () => ({
          draggedAttendeeId: "1",
          originBoatId: "200",
          originSeatNumber: 2,
          attendeeIdsInOriginBoat: List([ "2" ])
        }),
        getItemType: () => ASSIGNED_ATTENDEE
      };
      
      const assignAttendee = jest.fn();
      const unassignAttendee = jest.fn();
            
      const props = { 
        attendeeIdsInBoat: List([ "1" ]),
        boatId: "100",
        seatNumber: 1,
        attendeeId: "2",
        assignAttendee,
        unassignAttendee
      };
            
      dropSpec.drop(props, monitor);     
      
      expect(assignAttendee.mock.calls.length).toBe(1);
      expect(unassignAttendee.mock.calls.length).toBe(1);
    });
  });
});