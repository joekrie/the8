import { List, Map } from "immutable";

import AttendeeRecord from "./models/attendee-record";
import BoatRecord from "./models/boat-record";
import BoatDetailsRecord from "./models/boat-details-record";
import EventDetailsRecord from "./models/event-details-record";
import { PRACTICE_MODE } from "./models/event-modes";

const sampleState = {
  eventDetails: new EventDetailsRecord({
    eventId: "event-1",
    title: "June 1, 2016",
    mode: PRACTICE_MODE
  }),
  boats: new Map({
    "boat-1": new BoatRecord({
      details: new BoatDetailsRecord({
        boatId: "boat-1",
        title: "Lucky",
        seatCount: 4,
        isCoxed: true
      }),
      assignedSeats: Map([
        [1, "rower-1"]
      ])
    }),
    "boat-2": new BoatRecord({
      details: new BoatDetailsRecord({
        boatId: "boat-2",
        title: "Voyager 1",
        seatCount: 2,
        isCoxed: false
      }),
      assignedSeats: Map()
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