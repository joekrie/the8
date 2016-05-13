import { List, Map } from "immutable";
import { mount } from "enzyme";

import Boat from "../boat.component";
import BoatRecord from "../boat.record";
import BoatInfoRecord from "../boat-info.record";
import AttendeeRecord from "../attendee.record";

describe("<Boat />", () => {
  it("mounts without error", () => {
    const boat = new BoatRecord({
      boatInfo: new BoatInfoRecord({
        isCoxed: false,
        seatCount: 2
      }),
      assignedSeats: Map([
        [1, "rower-1"]
      ])
    });
    
    const attendees = List([
      new AttendeeRecord({ attendeeId: "rower-1" })
    ]);
    
    
  });
});