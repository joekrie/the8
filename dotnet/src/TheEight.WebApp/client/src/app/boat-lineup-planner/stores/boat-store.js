import { observable, computed, action } from "mobx"
import R from "ramda"

export class Boat {
  @observable boatId
  @observable title
  @observable seatCount
  @observable isCoxed
  @observable placements
  boatStore

  constructor(boatId, title, seatCount, isCoxed, placements, boatStore) {
    this.boatId = boatId
    this.title = title
    this.seatCount = seatCount
    this.isCoxed = isCoxed
    this.placements = placements
    this.boatStore = boatStore
  }

  @computed get attendees() {
    return this.boatStore
      .placements[this.boatId]
      .map(attn => this.boatStore.attendees[attn])
  }

  @computed get seats() {
    return R
      .range(this.isCoxed ? 0 : 1, this.seatCount + 1)
      .map(num => ({
        number: num,
        label: num === 0 ? "Cox" : num,
        attendee: R.find(R.propEq("attendeeId", this.placements[num]), this.boatStore.attendees)
      }))
  }

  @action updateTitle(title) {
    this.title = title
  }

  @action updateSpecs(seatCount, isCoxed) {
    this.seatCount = seatCount
    this.isCoxed = isCoxed
  }
}

export class Attendee {
  attendeeId
  @observable firstName
  @observable lastName

  constructor(attendeeId, firstName, lastName) {
    this.attendeeId = attendeeId
    this.firstName = firstName
    this.lastName = lastName
  }

  @computed get displayName() {
    return `${this.firstName} ${this.lastName}`
  }

  @computed get sortName() {
    return `${this.lastName}, ${this.firstName}`
  }
}

export default class BoatStore {
  @observable boats = []
  @observable attendees = []

  @action load() {
    this.boats.push(
      new Boat("boat-1", "Lucky", 8, true, {3: "attendee-1"}, this),
      new Boat("boat-2", "M1", 4, true, {}, this)
    )

    this.attendees.push(
      new Attendee("attendee-1", "John", "Doe")
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
