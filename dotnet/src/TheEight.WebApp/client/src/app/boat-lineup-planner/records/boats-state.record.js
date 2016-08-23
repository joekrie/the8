import { Record, List, Map, fromJS } from "immutable"

import EntityRecord from "./entity.record"

const defaults = {
  boats: Map()
}

export default class BoatsStateRecord extends Record(defaults) {
  static createFromServerData(serverData) {
    const boats = EntityMap.createMapFromServerData(serverData)
    return new BoatsStateRecord({ boats })
  }

  add(boatId, details) {
    const newBoat = BoatRecord.create(details)
    return this.setIn(["boats", boatId], newBoat)
  }

  remove(boatId) {
    return this.deleteIn(["boats", boatId])
  }
}
