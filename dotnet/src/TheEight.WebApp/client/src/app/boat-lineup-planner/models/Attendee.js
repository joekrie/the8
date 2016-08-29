import { observable, computed, action } from "mobx"
import R from "ramda"

export default class Attendee {
  attendeeId
  @observable displayName
  @observable sortName

  constructor(attendeeId, displayName, sortName) {
    this.attendeeId = attendeeId
    this.displayName = displayName
    this.sortName = sortName
  }
}
