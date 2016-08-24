import { observable, computed, action } from "mobx"

export class Attendee {
  @observable attendeeId
  @observable firstName
  @observable lastName
  
  @computed get displayName() {
    return `${this.firstName} ${this.lastName}`
  }

  @computed get sortName() {
    return `${this.lastName}, ${this.firstName}`
  }
}

export class AttendeeStore {
  @observable attendees = {}

  getAttendee(attendeeId) {
    return attendees[attendeeId]
  }
}
