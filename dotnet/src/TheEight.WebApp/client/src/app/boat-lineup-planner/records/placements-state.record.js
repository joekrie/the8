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

  get canUndo() {
    return this.revisionPosition > 0
  }

  get canRedo() {
    return this.revisionPosition < this.revisions.count()
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
