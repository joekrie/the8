import { observable, computed, action } from "mobx"

export default class Attendee {
  attendeeId
  @observable displayName
  @observable sortName
  @observable position
  @observable metric

  constructor(attendeeId, displayName, position, metric) {
    this.attendeeId = attendeeId
    this.displayName = displayName
    this.sortName = displayName
    this.position = position
    this.metric = metric
  }
}
