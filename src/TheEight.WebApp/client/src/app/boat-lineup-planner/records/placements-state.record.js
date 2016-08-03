import { Record, List, Map, fromJS } from "immutable"

export const defaults = {
  committedPlacements: Map(),
  uncommittedPlacementChanges: Map()
}

export class Unplacer {  // todo: this should probably be a record/immutable
  commit(committedPlacements, boatId, seatNumber) {
    return committedPlacements.deleteIn([boatId, seatNumber])
  }

  get attendeeId() {
    return undefined
  }
}

export class Placer {
  constructor(attendeeId) {
    this.attendeeId = attendeeId
  }

  commit(committedPlacements, boatId, seatNumber) {
    return committedPlacements.setIn([boatId, seatNumber], this.attendeeId)
  }
}

export function commitPlacementChanges(committedPlacements, uncommittedPlacements) {
  return committedPlacements.withMutations(placements => {
    uncommittedPlacements.forEach((modBoat, modBoatId) => {
      modBoat.forEach((modifier, modSeatNum) => {
        modifier.commit(placements, modBoatId, modSeatNum)
      })
    })
  })
}

export default class PlacementsStateRecord extends Record(defaults) {
  static createFromServerData(serverData) {
    const reviver = () => {

    }

    return fromJS(serverData, reviver)
  }

  getUncommittedPlacement(boatId, seatNumber) {
    const uncommitted = this.getIn(["uncommittedPlacementChanges", boatId, seatNumber])
    
    if (uncommitted && uncommitted.attendeeId) {
      return uncommitted.attendeeId
    }

    return this.getIn(["committedPlacements", boatId, seatNumber])
  }

  placeAttendee(attendeeId, newBoatId, newSeatNumber, oldBoatId, oldSeatNumber) {
    const attendeeInTarget = this.getUncommittedPlacement(newBoatId, newSeatNumber)

    if (attendeeInTarget) {
      return this
        .setIn(["uncommittedPlacementChanges", oldBoatId, oldSeatNumber], new Placer(attendeeInTarget))
        .setIn(["uncommittedPlacementChanges", newBoatId, newSeatNumber], new Placer(attendeeId))
    }

    if (oldBoatId) {
      return this
        .setIn(["uncommittedPlacementChanges", oldBoatId, oldSeatNumber], new Unplacer())
        .setIn(["uncommittedPlacementChanges", newBoatId, newSeatNumber], new Placer(attendeeId))
    }

    return this.setIn(["uncommittedPlacementChanges", newBoatId, newSeatNumber], new Placer(attendeeId))
  }

  unplaceAttendee(boatId, seatNumber) {
    return this.setIn(["uncommittedPlacementChanges", boatId, seatNumber], new Unplacer())
  }

  undoPlacementChanges() {
    return this.set("uncommittedPlacementChanges", Map())
  }

  commitPlacementChanges() {
    return this.update("committedPlacements", committedPlacements => 
      commitPlacementChanges(committedPlacements, this.uncommittedPlacementChanges))
  }
}
