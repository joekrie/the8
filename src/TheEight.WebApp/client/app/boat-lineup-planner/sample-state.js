import { List, Map, fromJS } from "immutable"
import { LocalDate } from "js-joda"

import AppStatusStateRecord from "boat-lineup-planner/models/app-status/app-status-state-record"

import AttendeesStateRecord from "boat-lineup-planner/models/attendees/attendees-state-record"
import AttendeeRecord from "boat-lineup-planner/models/attendees/attendee-record"
import * as AttendeePositions from "boat-lineup-planner/models/attendees/attendee-positions"

import BoatsStateRecord from "boat-lineup-planner/models/boats/boats-state-record"
import BoatRecord from "boat-lineup-planner/models/boats/boat-record"
import BoatDetailsRecord from "boat-lineup-planner/models/boats/boat-details-record"
import BoatListItemRecord from "boat-lineup-planner/models/boats/boat-list-item-record"

import EventStateRecord from "boat-lineup-planner/models/event/event-state-record"
import EventDetailsRecord from "boat-lineup-planner/models/event/event-details-record"
import * as EventTypes from "boat-lineup-planner/models/event/event-modes"

const sampleState = {
  appStatus: fromJS({
    isInitialDataLoaded: false
  }),
  event: fromJS({
    eventDetails: {
      saved: {
        eventId: "event-1",
        date: LocalDate.of(2016, 7, 30),
        notes: "",
        mode: "PRACTICE"
      },
      modified: {
        eventId: "event-1",
        date: LocalDate.of(2016, 7, 30),
        notes: "",
        mode: "PRACTICE"
      }
    },
    boats: {
      "boat-1": {
        boat: {
          details: {
            boatId: "boat-1",
            title: "Lucky",
            seatCount: 4,
            isCoxed: true
          }
        },
        isSaving: true
      },
      "boat-2": {
        boat: {
          details: {
            boatId: "boat-2",
            title: "Voyager 1",
            seatCount: 2,
            isCoxed: false
          }
        }
      }
    },
    placements: {
      saved: {
        "boat-1": {
          COXSWAIN: "attendee-1",
          1: "attendee-2"
        }
      },
      changes: {}
    }
    attendees: {
      attendees: [ 
        {
          attendeeId: "cox-1",
          sortName: "Hill, Dule",
          displayName: "Dule Hill",
          position: "COXSWAIN"
        },
        {
          attendeeId: "rower-1",
          sortName: "Sheen, Martin",
          displayName: "Martin Sheen",
          position: "PORT_ROWER"
        },
        {
          attendeeId: "rower-2",
          sortName: "Lowe, Rob",
          displayName: "Rob Lowe",
          position: "STARBOARD_ROWER"
        },
        {
          attendeeId: "rower-3",
          sortName: "Schiff, Richard",
          displayName: "Richard Schiff",
          position: "BISWEPTUAL_ROWER"
        },
        {
          attendeeId: "rower-4",
          sortName: "Janney, Allison",
          displayName: "Allison Janney",
          position: "STARBOARD_ROWER"
        },
        {
          attendeeId: "rower-5",
          sortName: "Spencer, John",
          displayName: "John Spencer",
          position: "PORT_ROWER"
        }
      ]
    }
  }
}

export default sampleState
