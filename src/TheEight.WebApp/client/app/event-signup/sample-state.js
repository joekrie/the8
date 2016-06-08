import { List, Map } from "immutable";

import EventRecord from "../models/event-record";

const sampleState = {
  events: [
    new EventRecord({
      eventId: "event-1",
      date: new DateTime(2016, 6, 8),
      notes: "Race day. 3 x 1k races"
    })
  ]
};

export default sampleState;