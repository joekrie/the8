import { Record, List, fromJS } from "immutable"

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
    return this.setIn(["boats", boatId, "modifiedDetails"], newBoatDetails)
  }

  areBoatDetailsModified() {
    const modified = this.getIn(["boats", boatId, "modifiedDetails"])
    const committed = this.getIn(["boats", boatId, "committedDetails"])
    return modified.equals(committed)
  }

  setIsSavingBoat(boatId, isSaving) {
    return this.setIn(["boats", boatId, "isSaving"], isSaving)
  }

  commitBoatDetailChanges(boatId) {
    const newBoatDetails = this.getIn(["boats", boatId, "modifiedDetails"])
    return this.setIn(["boats", boatId, "committedDetails"], newBoatDetails)
  }

  addBoat(boatId, boatDetails) {
    const newBoat = Map({
      modifiedDetails: boatDetails,
      committedDetails: boatDetails,
      isSaving: false
    })

    return this.setIn(["boats", boatId], newBoat)
  }

  removeBoat(boatId) {
    return this.deleteIn(["boats", boatId])
  }
}
