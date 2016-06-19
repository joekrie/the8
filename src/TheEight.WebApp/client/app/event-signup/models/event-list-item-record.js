import { Record, List } from "immutable";
import { LocalDate } from "js-joda";

import EventRecord from "./event-record";

const EventListItemRecord = Record({
  event: new EventRecord(),
  attendees: List(),
  isRegistered: false
});

export default EventListItemRecord