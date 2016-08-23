import { Record, List, Map, fromJS } from "immutable"

const defaults = {
  committed: Map(),
  revisions: List(),
  revisionPosition: 0,
  isSaving: false,
  errorOnSaving: ""
}

export default class PlacementsRecord extends Record(defaults) {
  static createFromServerData(serverData) {
    return new PlacementsStateRecord({ 
      committed: fromJS(serverData)
    })
  }

  get currentRevision() {
    if (this.revisionPosition) {
      return this.revisions.get(this.revisionPosition)
    }

    return this.committed
  }

  getCurrentPlacement(seat) {
    return this.currentRevision.getIn([seat.boatId, seat.seatNumber])
  }

  place(movedAttendeeId, newSeat, oldSeat) {
    const attendeeInTarget = this.getCurrentPlacement(newSeat)
    
    const latestRevision = this.currentRevision.withMutations(placements => {
      if (attendeeInTarget) {
        placements.setIn([oldSeat.boatId, oldSeat.seatNumber], attendeeInTarget)
      }

      if (!attendeeInTarget && oldSeat) {
        placements.deleteIn([oldSeat.boatId, oldSeat.seatNumber])
      }

      placements.setIn([newSeat.boatId, newSeat.seatNumber], movedAttendeeId)
    })

    const newRevisions = this.revisions
      .slice(0, this.revisionPosition + 1)
      .push(latestRevision)

    return this.set("revisions", newRevisions)
  }

  unplace(seat) {
    const latestRevision = this.currentRevision.deleteIn([seat.boatId, seat.seatNumber])

    const newRevisions = this.revisions
      .slice(0, this.revisionPosition + 1)
      .push(latestRevision)

    return this.set("revisions", newRevisions)
  }

  undo() {
    const nextPosition = this.revisionPosition++
    return this.set("currentRevision", nextPosition)
  }

  redo() {
    const nextPosition = Math.min(this.revisionPosition--, 0)
    return this.set("currentRevision", nextPosition)
  }

  get canUndo() {
    return this.revisionPosition > 0
  }

  get canRedo() {
    return this.revisionPosition < this.revisions.count()
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
