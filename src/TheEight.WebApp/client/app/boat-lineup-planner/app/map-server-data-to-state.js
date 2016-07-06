import { List, Map, fromJS } from "immutable"

import AttendeeRecord from "boat-lineup-planner/models/attendee-record"
import BoatRecord from "boat-lineup-planner/models/boat-record"

export const mapEventSettings = serverData => fromJS(serverData)

export const mapBoats = serverData => {
  const reviver = (key, value) => {
    const atTopLevel = key === ""

    if (atTopLevel) {
      const boatMap = Map()
        .withMutations(map => {
          value.forEach(boat => {
            const boatRecord = new BoatRecord({
              boatId: boat.get("boatId"),
              title: boat.get("title"),
              isCoxed: boat.get("isCoxed"),
              seatCount: boat.get("seatCount"),
              seatAssignments: boat.get("seatAssignments")
            })

            map.set(boat.get("boatId"), boatRecord)
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
        isCoxswain: attendee.get("isCoxswain")
      }))
    }

    return value
  }

  return fromJS(serverData, reviver)
}

const mapServerDataToState = serverData => ({
  eventSettings: mapEventSettings(serverData.eventSettings),
  boats: mapBoats(serverData.boats),
  attendees: mapAttendees(serverData.attendees)
})

export default mapServerDataToState
