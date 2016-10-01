import { observable, computed, action } from "mobx"
import { flatten } from "ramda"
import chroma from "chroma-js"

import Boat from "./boat"

export default class BoatStore {
  @observable boats = []

  constructor(attendeeStore) {
    this.attendeeStore = attendeeStore
  }

  @action load() {
    this.addBoat({
      boatId: "boat-1",
      title: "Lucky",
      seatCount: 8,
      isCoxed: true,
      placements: { 
        3: "attendee-1",
        1: "attendee-2"
      },
      color: {
        background: chroma("#001f3f"),
        text: chroma("hsla(210, 100%, 75%, 1.0)")
      }
    })

    this.addBoat({
      boatId: "boat-2",
      title: "M1",
      seatCount: 4,
      isCoxed: true,
      color: {
        background: chroma("#01FF70"),
        text: chroma("hsla(146, 100%, 20%, 1.0)")
      }
    })
  }

  @action addBoat(details) {
    this.boats.push(new Boat(details.boatId, details.title, details.seatCount, details.isCoxed, 
      details.placements || {}, details.color, attnId => this.attendeeStore.getAttendeeById(attnId)))
  }

  isAttendeePlacedInAnyBoat(attendeeId) {
    return flatten(this.boats.map(boat => boat.placements.values()))
      .includes(attendeeId)
  }

  attendeePlacements(attendeeId) {
    return this.boats.map(boat => 
      boat.placements.map()
    )
  }
}
