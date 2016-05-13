import { List, Map, fromJS } from "immutable";

import AttendeeRecord from "./records/attendee";
import BoatRecord from "./records/boat";
import WaterEventRecord from "./records/water-event";

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