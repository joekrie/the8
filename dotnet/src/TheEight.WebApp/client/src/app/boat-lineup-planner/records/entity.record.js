import { Record, List, Map, fromJS } from "immutable"

const defaults = {
  isSaving: false,
  details: Map({
    committed: Map(),
    uncommitted: Map()
  })
}

export default class EntityRecord extends Record(defaults) {
  static create(details) {
    return new EntityRecord({
      details: Map({
        committed: details,
        uncommitted: details
      })
    })
  }

  static createMapFromServerData(serverData) {
    const entities = fromJS(serverData, (key, value) => {
      if (!key) {
        return detailsMap.map(details => EntityRecord.create(details))
      }

      return value
    })

    return entities
  }

  get isModified() {
    const uncommitted = this.getIn(["details" "uncommitted"])
    const committed = this.getIn(["details", "committed"])
    return committed.equals(uncommitted)
  }

  commit() {
    const uncommitted = this.getIn(["details", "uncommitted"])
    return this.setIn(["details", "committed"], uncommitted)
  }

  undo(boatId) {
    const committed = this.getIn(["details", "committed"])
    return this.setIn(["details", "uncommitted"], committed)
  }
}
