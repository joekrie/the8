import { observable, computed, action } from "mobx"

export class Placement {
  @observable attendeeId
  boatId
  attendeeStore

  constructor(attendeeId, boatId, attendeeStore) {
    this.attendeeId = attendeeId
    this.boatId = boatId
    this.attendeeStore = attendeeStore
  }

  @computed get attendee() {
    return this.attendeeStore.getAttendee(this.attendeeId)
  }

  @action setAttendee(attendeeId) {
    this.attendeeId = attendeeId
  }

  @action empty() {
    this.attendeeId = null
  }
}

export class PlacementStore {
  @observable committedPlacements
  @observable placementRevisions = List()
  @observable revisionPosition = 0

  @action placeAttendee(newSeat, oldSeat, attendeeId) {
    const attendeeInTarget = state.getCurrentPlacement(newSeat)
    
    const latestRevision = state.currentRevision.withMutations(placements => {
      if (attendeeInTarget) {
        placements.setIn([oldSeat.boatId, oldSeat.seatNumber], attendeeInTarget)
      }

      if (!attendeeInTarget && oldSeat) {
        placements.deleteIn([oldSeat.boatId, oldSeat.seatNumber])
      }

      placements.setIn([newSeat.boatId, newSeat.seatNumber], attendeeId)
    })

    const newRevisions = state.revisions
      .slice(0, state.revisionPosition + 1)
      .push(latestRevision)

    return state.set("revisions", newRevisions)
  }

  @action unplaceAttendee(boatId, seatNumber) {
    const latestRevision = state.currentRevision.deleteIn([boatId, seatNumber])

    const newRevisions = state.revisions
      .slice(0, state.revisionPosition + 1)
      .push(latestRevision)

    return stste.set("revisions", newRevisions)
  }
}
