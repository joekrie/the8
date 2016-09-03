import { observable, computed, action } from "mobx"
import R from "ramda"

export default class Attendee {
  attendeeId
  @observable displayName
  @observable sortName
  @observable position
  @observable isDragging = false

  constructor(attendeeId, displayName, sortName, position) {
    this.attendeeId = attendeeId
    this.displayName = displayName
    this.sortName = sortName
    this.position = position
  }

  @action startDragging() {
    this.isDragging = true
  }

  @action stopDragging() {
    this.isDragging = false
  }
}
