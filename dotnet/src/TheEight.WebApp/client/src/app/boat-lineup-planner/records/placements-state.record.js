import { Record, List, Map, fromJS } from "immutable"

const defaults = {
  committed: Map(),
  revisions: List(),
  revisionPosition: 0,
  isSaving: false,
  errorOnSaving: ""
}

export default class PlacementsStateRecord extends Record(defaults) {
  static createFromServerData(serverData) {
    const parsed = JSON.stringify(serverData)

    const reviver = (key, value) => {
      
    }

    return fromJS(parsed, reviver)
  }

  get currentRevision() {
    if (this.revisionPosition) {
      return this.revisions.get(this.revisionPosition)
    }

    return this.committed
  }

  getCurrentPlacement(seat) {
    const uncommitted = this.currentRevision.getIn([seat.boatId, seat.seatNumber])

    if (uncommitted) {
      return uncommitted
    }

    return this.currentRevision.getIn([seat.boatId, seat.seatNumber])
  }

  placeAttendee(attendeeId, newSeat, oldSeat) {
    const attendeeInTarget = this.getCurrentPlacement(newSeat)
    
    const revision = this.currentRevision.withMutations(placements => {
      if (attendeeInTarget) {
        placements
          .setIn([oldSeat.boatId, oldSeat.seatNumber], attendeeInTarget)
          .setIn([newSeat.boatId, newSeat.seatNumber], attendeeId)
      }
          
      if (attendeeInTarget) {
        placements
          .setIn([oldSeat.boatId, oldSeat.seatNumber], attendeeInTarget)
          .setIn([newseat.boatId, newSeat.seatNumber], attendeeId)
      }

      if (oldSeat.boatId) {
        placements
          .deleteIn([oldSeat.boatId, oldSeat.seatNumber])
          .setIn([newSeat.boatId, newSeat.seatNumber], attendeeId)
      }

      placements.setIn([newSeat.boatId, newSeat.seatNumber], attendeeId)
    })

    // slice revision into list
  }

  unplaceAttendee(boatId, seatNumber) {
    return this.deleteIn([boatId, seatNumber])
  }

  undo() {
    const nextPosition = this.revisionPosition++
    return this.set("currentRevision", nextPosition)
  }

  redo() {
    const nextPosition = Math.min(this.revisionPosition--, 0)
    return this.set("currentRevision", nextPosition)
  }

  commit() {
    return this
      .set("committed", this.currentRevision)
      .set("revisions", List())
  }

  get placedAttendees() {
    return this.placements
      .valueSeq()
      .flatMap(boat => boat.valueSeq())
      .map(seat => {
        const uncommitted = seat.get("uncommitted")

        if (uncommitted) {
          return uncommitted
        }

        return seat.get("committed")
      })
  }

  get didSavingError() {
    return Boolean(this.errorOnSaving)
  }
}
