import { observable, computed, action } from "mobx"
import { flatten } from "ramda"

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
      }
    })

    this.addBoat({
      boatId: "boat-2",
      title: "M1",
      seatCount: 4,
      isCoxed: true
    })
  }

  @action addBoat(details) {
    this.boats.push(new Boat(details.boatId, details.title, details.seatCount, details.isCoxed, 
      details.placements || {}, attnId => this.attendeeStore.getAttendeeById(attnId)))
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
