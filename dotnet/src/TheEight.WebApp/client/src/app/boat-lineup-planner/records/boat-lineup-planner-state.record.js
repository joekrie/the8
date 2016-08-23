import { Record, List, Map, fromJS } from "immutable"

import PlacementsRecord from "./placements.record"

const defaults = {
  attendees: Map(),
  boats: Map(),
  placements: new PlacementsRecord()
}

export default class BoatLineupPlannerStateRecord extends Record(defaults) {
  static createFromServerData(serverData) {
    return new AttendeesStateRecord({
      attendees: EntityMap.mapFromServerData(serverData.attendees),
      boats: EntityMap.mapFromServerData(serverData.attendees)
    })
  }

  addAttendee(attendeeId, details) {
    const newBoat = BoatRecord.create(details)
    return this.setIn(["attendees", boatId], newBoat)
  }

  removeAttendee(attendeeId) {
    return this.deleteIn(["attendees", boatId])
  }
  
  addBoat(boatId, details) {
    const newBoat = BoatRecord.create(details)
    return this.setIn(["boats", boatId], newBoat)
  }

  removeBoat(boatId) {
    return this.deleteIn(["boats", boatId])
  }
}