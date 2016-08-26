import { observable, computed, action } from "mobx"

export class Boat {
  @observable boatId
  @observable title
  @observable seatCount
  @observable isCoxed
  boatStore

  constructor(boatId, title, seatCount, isCoxed, boatStore) {
    this.boatId = boatId
    this.title = title
    this.seatCount = seatCount
    this.isCoxed = isCoxed
    this.boatStore = boatStore
  }

  @computed get attendees() {
    return this.boatStore
      .placements[this.boatId]
      .map(attn => this.boatStore.attendees[attn])
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
  @observable boats = {}
  @observable placements = {}

  @action load() {
    this.boats = {
      "boat-1": new Boat("boat-1", "Lucky", 8, true, this),
      "boat-2": new Boat("boat-2", "M1", 4, true, this)
    }

    console.log(this)

    return;
    fetch("http://jsonplaceholder.typicode.com/todos")
      .then(resp => resp.json())
      .then(json => console.log("parsed json", json))
      .catch(ex => console.log("parsing failed", ex))
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
