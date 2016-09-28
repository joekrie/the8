import { observable, computed, action, asMap } from "mobx"
import { range } from "lodash"
import { pickBy } from "ramda"

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
    this.placements = asMap(placements)
    this.getAttendeeById = getAttendeeById
  }

  @computed get seatNumbers() {
    return range(this.isCoxed ? 0 : 1, this.seatCount + 1)
  }

  @computed get seats() {
    return this.seatNumbers
      .map(num => ({
        number: num,
        label: num == 0 ? "C" : String(num),
        attendee: this.getAttendeeById(this.placements.get(num))
      }))
  }

  isAttendeeInBoat(attendeeId) {
    return this.placements.values().includes(attendeeId)
  }

  allowPlaceAttendee(attendeeId, seatNumber, oldSeat) {
    const alreadyInBoat = isAttendeeInBoat(attendeeId)
    
    if (!oldSeat) {
      return !alreadyInBoat
    }
    
    const isMoveWithinBoat = oldSeat.boatId == this.boatId
    const isSameSeat = seatNumber == oldSeat.seatNumber && isMoveWithinBoat
    return !isSameSeat && (isMoveWithinBoat || !alreadyInBoat)
  }

  @action placeAttendee(attendeeId, seatNumber) {
    this.placements.set(seatNumber, attendeeId)
  }

  @action unplaceAttendee(seatNumber) {
    this.placements.delete(seatNumber)
  }

  @action updateTitle(title) {
    this.title = title
  }

  @action updateSize(seatCount, isCoxed) {
    this.seatCount = seatCount
    this.isCoxed = isCoxed

    this.placements = pickBy((attnId, seatNum) => seatNum <= this.seatCount 
      && (seatNum > 0 || this.isCoxed), this.placements)
  }
}
