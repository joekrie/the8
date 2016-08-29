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

  isAttendeeInBoat(attendeeId) {
    return R.values(this.placements)
      .includes(attendeeId)
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
    this.placements[seatNumber] = attendeeId
  }

  @action unplaceAttendee(seatNumber) {
    delete this.placements[seatNumber]
  }

  @action updateTitle(title) {
    this.title = title
  }

  @action updateSize(seatCount, isCoxed) {  // todo: when shrinking should it unassign?
    this.seatCount = seatCount
    this.isCoxed = isCoxed

    this.placements = R.pickBy((attnId, seatNum) => seatNum <= this.seatCount 
      && (seatNum > 0 || this.isCoxed), this.placements)
  }
}
