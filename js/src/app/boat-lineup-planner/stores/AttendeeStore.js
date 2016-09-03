import { observable, computed, action } from "mobx"
import R from "ramda"

import Attendee from "../models/Attendee"

export default class AttendeeStore {
  @observable attendees = []
  @observable draggingAttendee

  getAttendeeById(attendeeId) {
    return R.find(R.propEq("attendeeId", attendeeId), this.attendees)
  }
  
  @action load() {
    this.attendees.push(
      new Attendee("attendee-1", "John Doe", "Doe, John", "PORT_ROWER")
    )
  }
}
