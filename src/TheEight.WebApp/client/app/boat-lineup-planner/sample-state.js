import { List, Map } from "immutable"
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
  appStatus: new AppStatusStateRecord({
    isInitialDataLoaded: false
  }),
  event: new EventStateRecord({
    details: new EventDetailsRecord({
      eventId: "event-1",
      date: LocalDate.of(2016, 7, 30),
      notes: "",
      mode: EventTypes.PRACTICE_MODE
    }),
    isLoaded: false,
    isLoading: false,
    isSaving: false
  }),
  boats: new BoatsStateRecord({
    boats: Map({
      "boat-1": new BoatListItemRecord({
        boat: new BoatRecord({
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
        isSaving: true
      }),
      "boat-2": new BoatListItemRecord({
        boat: new BoatRecord({
          details: new BoatDetailsRecord({
            boatId: "boat-2",
            title: "Voyager 1",
            seatCount: 2,
            isCoxed: false
          }),
          assignedSeats: Map()
        }),
        isSaving: false
      })
    }),    
    isLoaded: false,
    isLoading: false,
  }),
  attendees: new AttendeesStateRecord({
    attendees: List([ 
      new AttendeeRecord({
        attendeeId: "cox-1",
        sortName: "Hill, Dule",
        displayName: "Dule Hill",
        position: AttendeePositions.COXSWAIN
      }),
      new AttendeeRecord({
        attendeeId: "rower-1",
        sortName: "Sheen, Martin",
        displayName: "Martin Sheen",
        position: AttendeePositions.PORT_ROWER
      }),
      new AttendeeRecord({
        attendeeId: "rower-2",
        sortName: "Lowe, Rob",
        displayName: "Rob Lowe",
        position: AttendeePositions.STARBOARD_ROWER
      }),
      new AttendeeRecord({
        attendeeId: "rower-3",
        sortName: "Schiff, Richard",
        displayName: "Richard Schiff",
        position: AttendeePositions.BISWEPTUAL_ROWER
      }),
      new AttendeeRecord({
        attendeeId: "rower-4",
        sortName: "Janney, Allison",
        displayName: "Allison Janney",
        position: AttendeePositions.STARBOARD_ROWER
      }),
      new AttendeeRecord({
        attendeeId: "rower-5",
        sortName: "Spencer, John",
        displayName: "John Spencer",
        position: AttendeePositions.PORT_ROWER
      })
    ]),
    isLoaded: false,
    isLoading: false,
    loadingErrorMessage: null
  })
}

export default sampleState
