import { observable, computed, action } from "mobx"
import R from "ramda"

import Attendee from "../models/Attendee"

export default class AttendeeStore {
  @observable attendees = []

  getAttendeeById(attendeeId) {
    return this.attendees[attendeeId]
  }
  
  @action load() {
    this.attendees.push(
      new Attendee("attendee-1", "John Doe", "Doe, John")
    )
  }
}
