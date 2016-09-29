import { observable, computed, action } from "mobx"
import { find, propEq } from "ramda"

import Attendee from "./attendee"

export default class AttendeeStore {
  @observable attendees = []
  @observable draggingAttendee

  getAttendeeById(attendeeId) {
    return find(propEq("attendeeId", attendeeId), this.attendees)
  }
  
  @action load() {
    this.attendees.push(
      new Attendee("attendee-1", "John Doe", "Doe, John", "PORT_ROWER"),
      new Attendee("attendee-2", "Johnny Appleseed", "Appleseed, Johnny", "STARBOARD_ROWER")
    )
  }
}
