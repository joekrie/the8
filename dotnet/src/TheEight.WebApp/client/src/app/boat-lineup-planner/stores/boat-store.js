import { observable, computed, action } from "mobx"

export class Boat {
  @observable boatId
  @observable title
  @observable seatCount
  @observable isCoxed

  @action updateTitle(title) {
    this.title = title
  }

  @action updateSpecs(seatCount, isCoxed) {
    this.seatCount = seatCount
    this.isCoxed = isCoxed
  }
}

export class BoatPlacements {
  @observable seatPlacements = {}
}

export class BoatStore {
  @observable boats = {}
}
