import { observable, computed, action } from "mobx"
import R from "ramda"

export default class Boat {
  @observable boatId
  @observable title
  @observable seatCount
  @observable isCoxed
  @observable placements
  getAttendeeById

  constructor(boatId, title, seatCount, isCoxed, placements, getAttendeeById) {
    this.boatId = boatId
    this.title = title
    this.seatCount = seatCount
    this.isCoxed = isCoxed
    this.placements = placements
    this.getAttendeeById = getAttendeeById
  }

  @computed get attendees() {
    return this.placements[this.boatId]
      .map(attn => this.getAttendeeById(attn))
  }

  @computed get seatNumbers() {
    return R.range(this.isCoxed ? 0 : 1, this.seatCount + 1)
  }

  @computed get seats() {
    return this.seatNumbers
      .map(num => ({
        number: num,
        label: num === 0 ? "Cox" : num,
        attendee: this.getAttendeeById(this.placements[num])
      }))
  }

  @action updateTitle(title) {
    this.title = title
  }

  @action updateSpecs(seatCount, isCoxed) {  // todo: when shrinking should it unassign?
    this.seatCount = seatCount
    this.isCoxed = isCoxed
  }
}
