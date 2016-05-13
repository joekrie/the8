import { List, Map } from "immutable";

import AttendeeRecord from "./records/attendee";
import BoatRecord from "./records/boat";
import EventInfoRecord from "./records/event-info";

const sampleState = {
  eventSettings: new EventInfoRecord({
    canAttendeeOccupyMultipleBoats: true
  }),
  boats: new Map({
    "boat-1": new BoatRecord({
      boatId: "boat-1",
      title: "Lucky",
      seatCount: 4,
      isCoxed: true,
      seatAssignments: Map([
        [1, "rower-1"]
      ])
    }),
    "boat-2": new BoatRecord({
      boatId: "boat-2",
      title: "Voyager 1",
      seatCount: 2,
      isCoxed: false,
      seatAssignments: Map()
    })
  }),
  attendees: new List([ 
    new AttendeeRecord({
      attendeeId: "cox-1",
      sortName: "Hill, Dule",
      displayName: "Dule Hill",
      isCoxswain: true
    }),
    new AttendeeRecord({
      attendeeId: "rower-1",
      sortName: "Sheen, Martin",
      displayName: "Martin Sheen"
    }),
    new AttendeeRecord({
      attendeeId: "rower-2",
      sortName: "Lowe, Rob",
      displayName: "Rob Lowe"
    }),
    new AttendeeRecord({
      attendeeId: "rower-3",
      sortName: "Schiff, Richard",
      displayName: "Richard Schiff"
    }),
    new AttendeeRecord({
      attendeeId: "rower-4",
      sortName: "Janney, Allison",
      displayName: "Allison Janney"
    }),
    new AttendeeRecord({
      attendeeId: "rower-5",
      sortName: "Spencer, John",
      displayName: "John Spencer"
    })
  ])
};

export default sampleState;