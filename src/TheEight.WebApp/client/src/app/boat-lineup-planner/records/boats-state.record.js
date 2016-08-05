import { Record, List, Map, fromJS } from "immutable"

const defaults = {
  boats: Map()
}

export default class BoatsStateRecord extends Record(defaults) {
  static createFromServerData(serverData) {
    const reviver = () => {

    }

    fromJS(serverData, reviver)
  }

  modifyBoatDetails(boatId, newBoatDetails) {
    return this.setIn(["boats", boatId, "uncommittedDetails"], newBoatDetails)
  }

  areBoatDetailsModified() {
    const uncommitted = this.getIn(["boats", boatId, "uncommittedDetails"])
    return Boolean(committed)
  }

  setIsSavingBoat(boatId, isSaving) {
    return this.setIn(["boats", boatId, "isSaving"], isSaving)
  }

  commitBoatDetailChanges(boatId) {
    const uncommittedDetails = this.getIn(["boats", boatId, "uncommittedDetails"])

    if (uncommittedDetails) {
      return this.setIn(["boats", boatId, "committedDetails"], newBoatDetails)
    }

    return this;
  }

  undoBoatDetailChanges(boatId) {
    return this.deleteIn(["boats", boatId, "committedDetails"], newBoatDetails)
  }

  addBoat(boatId, boatDetails) {
    const newBoat = Map({
      committedDetails: boatDetails,
      isSaving: false
    })

    return this.setIn(["boats", boatId], newBoat)
  }

  removeBoat(boatId) {
    return this.deleteIn(["boats", boatId])
  }
}
