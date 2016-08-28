import { observable, computed, action } from "mobx"
import R from "ramda"

import Boat from "../models/Boat"

export default class BoatStore {
  @observable boats = []

  constructor(getAttendeeById) {
    this.getAttendeeById = getAttendeeById
  }

  @action load() {  // todo: replace with function injected in constructor?
    this.boats.push(
      new Boat("boat-1", "Lucky", 8, true, {3: "attendee-1"}, this.getAttendeeById),
      new Boat("boat-2", "M1", 4, true, {}, this.getAttendeeById)
    )
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
