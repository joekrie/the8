import { List, Map } from "immutable"
import { LocalDate } from "js-joda"

import AttendeeRecord from "../models/attendee-record"
import EventRecord from "../models/event-record"
import EventListItemRecord from "../models/event-list-item-record"
import SettingsRecord from "../models/settings-record"

import {
  WATER_EVENT, 
  ERG_EVENT
} from "../models/event-types"

import {
  COXSWAIN, 
  PORT_ROWER, 
  STARBOARD_ROWER, 
  BISWEPTUAL_ROWER 
} from "../models/attendee-positions"

const sampleState = {
  settings: new SettingsRecord({
    showRegisteredAttendees: true,
    attendeeId: "rower-1"
  }),
  events: Map({
    "event-1": new EventListItemRecord({
      event: new EventRecord({
        eventId: "event-1",
        date: LocalDate.of(2016, 7, 30),
        notes: "",
        type: WATER_EVENT
      }),
      attendees: List([
        new AttendeeRecord({
          attendeeId: "cox-1",
          sortName: "Hill, Dule",
          displayName: "Dule Hill",
          position: COXSWAIN
        }),
        new AttendeeRecord({
          attendeeId: "rower-1",
          sortName: "Sheen, Martin",
          displayName: "Martin Sheen",
          position: PORT_ROWER
        })
      ]),
      isRegistered: true
    }),
    "event-2": new EventListItemRecord({
      event: new EventRecord({
        eventId: "event-2",
        date: LocalDate.of(2016, 7, 30),
        notes: "",
        type: ERG_EVENT
      }),
      attendees: List([
        new AttendeeRecord({
          attendeeId: "rower-3",
          sortName: "Schiff, Richard",
          displayName: "Richard Schiff",
          position: BISWEPTUAL_ROWER
        }),
        new AttendeeRecord({
          attendeeId: "rower-4",
          sortName: "Janney, Allison",
          displayName: "Allison Janney",
          position: STARBOARD_ROWER
        })
      ]),
      isRegistered: false
    })
  })
}

export default sampleState