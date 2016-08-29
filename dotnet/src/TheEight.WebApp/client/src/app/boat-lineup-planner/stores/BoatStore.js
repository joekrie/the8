import { observable, computed, action } from "mobx"
import R from "ramda"

import Boat from "../models/Boat"

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
        3: "attendee-1"
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

  @action placeAttendee(newSeat, oldSeat, attendeeId) {
    const attendeeInTarget = this.placements[newSeat.boatId][newSeat.seatNumber]

    if (attendeeInTarget) {
      this.placements[oldSeat.boatId][oldSeat.seatNumber] = attendeeInTarget
    }

    if (!attendeeInTarget && oldSeat) {
      delete this.placements[oldSeat.boatId][oldSeat.seatNumber]
    }

    this.placements[newSeat.boatId][newSeat.seatNumber] = attendeeId
  }

  @action unplaceAttendee(seat) {
     delete this.placements[seat.boatId][seat.seatNumber]
  }
}
