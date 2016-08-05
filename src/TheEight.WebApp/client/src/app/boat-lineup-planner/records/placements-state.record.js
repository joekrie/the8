import { Record, List, Map, fromJS } from "immutable"

export const defaults = {
  placements: Map(),
  isSaving: false,
  errorOnSaving: ""
}

export default class PlacementsStateRecord extends Record(defaults) {
  static createFromServerData(serverData) {
    const reviver = () => {

    }

    return fromJS(serverData, reviver)
  }

  getUncommittedPlacement(boatId, seatNumber) {
    const uncommitted = this.placements.getIn([boatId, seatNumber, "uncommitted"])

    if (uncommitted) {
      return uncommitted
    }

    return this.placements.getIn([boatId, seatNumber, "committed"])
  }

  placeAttendee(attendeeId, newBoatId, newSeatNumber, oldBoatId, oldSeatNumber) {
    const attendeeInTarget = this.getUncommittedPlacement(newBoatId, newSeatNumber)

    if (attendeeInTarget) {
      return this
        .setIn(["placements", oldBoatId, oldSeatNumber, "uncommitted"], attendeeInTarget)
        .setIn(["placements", newBoatId, newSeatNumber, "uncommitted"], attendeeId)
    }

    if (oldBoatId) {
      return this
        .deleteIn(["placements", oldBoatId, oldSeatNumber, "uncommitted"])
        .setIn(["placements", newBoatId, newSeatNumber, "uncommitted"], attendeeId)
    }

    return this.setIn(["placements", newBoatId, newSeatNumber, "uncommitted"], attendeeId)
  }

  unplaceAttendee(boatId, seatNumber) {
    return this.deleteIn(["placements", boatId, seatNumber, "uncommitted"])
  }

  undoPlacementChanges() {
    return this.withMutations(record => {
      record.placements.forEach((boat, boatId) => {
        boat.forEach(placement => {
          placement.set("uncommitted", placement.get("committed"))
        })
      })
    })
  }

  commitPlacementChanges() {
    return this.withMutations(record => {
      record.placements.forEach((boat, boatId) => {
        boat.forEach(placement => {
          placement.set("committed", placement.get("uncommitted"))
        })
      })
    })
  }

  get didSavingError() {
    return Boolean(this.errorOnSaving)
  }
}
