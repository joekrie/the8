import { List, Map, fromJS } from "immutable";

import AttendeeRecord from "./models/attendee";
import BoatRecord from "./models/boat";
import EventInfoRecord from "./models/event-info";

const mapEventSettings = serverData => fromJS(serverData);

const mapBoats = serverData => {
  const reviver = (key, value) => {
    if (key === "") {
      const boatMap = Map()
        .withMutations(map => {
          value.forEach(boat => {
            const boatId = boat.get("boatId");

            const boatRecord = new BoatRecord({
              boatId,
              title: boat.get("title"),
              isCoxed: boat.get("isCoxed"),
              seatCount: boat.get("seatCount"),
              seatAssignments: boat.get("seatAssignments")
            });

            map.set(boatId, boatRecord);
          });
        });

      return boatMap;
    }

    return value;
  };

  return fromJS(serverData, reviver);
};

const mapAttendees = serverData => {
  const reviver = (key, value) => {
    if (key === "") {
      return value.map(attendee => new AttendeeRecord({
        attendeeId: attendee.get("attendeeId"),
        displayName: attendee.get("displayName"),
        sortName: attendee.get("sortName"),
        isCoxswain: attendee.get("isCoxswain")
      }));
    }

    return value;
  };

  return fromJS(serverData, reviver);
};

const mapServerDataToState = serverData => ({
  eventSettings: mapEventSettings(serverData.eventSettings),
  boats: mapBoats(serverData.boats),
  attendees: mapAttendees(serverData.attendees)
});

export default mapServerDataToState