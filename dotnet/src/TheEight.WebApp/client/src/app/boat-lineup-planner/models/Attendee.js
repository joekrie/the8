import { observable, computed, action } from "mobx"
import R from "ramda"

export default class Attendee {
  attendeeId
  @observable displayName
  @observable sortName
  @observable position

  constructor(attendeeId, displayName, sortName, position) {
    this.attendeeId = attendeeId
    this.displayName = displayName
    this.sortName = sortName
    this.position = position
  }
}
