import { List, Map, fromJS } from "immutable"

import AttendeeRecord from "boat-lineup-planner/models/attendee-record"
import BoatRecord from "boat-lineup-planner/models/boat-record"
import BoatDetailsRecord from "boat-lineup-planner/models/boat-details-record"
import EventDetailsRecord from "boat-lineup-planner/models/event-details-record"

export const mapEventSettings = serverData => {
  const reviver = (key, value) => {
    const atTopLevel = key === ""

    if (atTopLevel) {
      return new EventDetailsRecord(value)
    }

    return value
  }

  return fromJS(serverData, reviver)
}

export const mapBoats = serverData => {
  const reviver = (key, value) => {
    const atTopLevel = key === ""

    if (atTopLevel) {
      const boatMap = Map()
        .withMutations(map => {
          value.forEach(boat => {
            const boatRecord = new BoatRecord({
              details: new BoatDetailsRecord({
                boatId: boat.getIn(["details", "boatId"]),
                title: boat.getIn(["details", "title"]),
                isCoxed: boat.getIn(["details", "isCoxed"]),
                seatCount: boat.getIn(["details", "seatCount"])
              }),
              assignedSeats: boat.get("assignedSeats")
            })

            map.set(boat.getIn(["details", "boatId"]), boatRecord)
          })
        })

      return boatMap
    }

    return value
  }

  return fromJS(serverData, reviver)
}

export const mapAttendees = serverData => {
  const reviver = (key, value) => {
    const atTopLevel = key === ""

    if (atTopLevel) {
      return value.map(attendee => new AttendeeRecord({
        attendeeId: attendee.get("attendeeId"),
        displayName: attendee.get("displayName"),
        sortName: attendee.get("sortName"),
        position: attendee.get("position")
      }))
    }

    return value
  }

  return fromJS(serverData, reviver)
}

const mapServerDataToState = serverData => ({
  eventDetails: mapEventSettings(serverData.eventSettings),
  boats: mapBoats(serverData.boats),
  attendees: mapAttendees(serverData.attendees)
})

export default mapServerDataToState
