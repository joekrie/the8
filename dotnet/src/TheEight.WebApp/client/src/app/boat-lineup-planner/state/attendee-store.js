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
      new Attendee("attendee-1", "Sterling Koepp", "PORT_ROWER", "1:44"),
      new Attendee("attendee-2", "Sven Hagenes", "STARBOARD_ROWER", "1:51"),      
      new Attendee("attendee-3", "Steve Page", "BISWEPTUAL_ROWER", "1:43"),
      new Attendee("attendee-4", "Levi Kemmer", "COXSWAIN", ""),
      new Attendee("attendee-5", "Orland Hessel", "PORT_ROWER", "1:53"),
      new Attendee("attendee-6", "Garrett Schamberger", "STARBOARD_ROWER", "1:45"),
      new Attendee("attendee-7", "Kianna Johnson", "COXSWAIN", ""),
      new Attendee("attendee-8", "Devon Ritchie", "BISWEPTUAL_ROWER", "1:51"),
      new Attendee("attendee-9", "Terrence Hegmann", "PORT_ROWER", "1:56"),
      new Attendee("attendee-10", "Astrid Hoppe", "STARBOARD_ROWER", "1:49"),
      new Attendee("attendee-11", "Michel Ondricka", "PORT_ROWER", "1:41"),
      new Attendee("attendee-12", "Brain Bogisich", "BISWEPTUAL_ROWER", "1:54")
    )
  }
}
