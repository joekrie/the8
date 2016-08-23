import { Record, List, Map, fromJS } from "immutable"

const defaults = {
  attendees: Map()
}

export default class AttendeesStateRecord extends Record(defaults) {
  static createFromServerData(serverData) {
    return new AttendeesStateRecord({
      attendees: EntityMap.createMapFromServerData(serverData)
    })
  }

  add(attendeeId, details) {
    const newBoat = BoatRecord.create(details)
    return this.setIn(["attendees", boatId], newBoat)
  }

  remove(attendeeId) {
    return this.deleteIn(["attendees", boatId])
  }
}