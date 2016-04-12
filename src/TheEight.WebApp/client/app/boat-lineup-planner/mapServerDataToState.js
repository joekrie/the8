import { fromJS } from "immutable";
import BoatRecord from "./records/BoatRecord";
import AttendeeRecord from "./records/AttendeeRecord";

export const mapEventSettings = serverData => fromJS(serverData);

export const mapBoats = serverData => {
    const reviver = (key, value) => {
        if (key === "") {
            return value.map(boat => new BoatRecord({
                boatId: boat.get("boatId"),
                title: boat.get("title"),
                isCoxed: boat.get("isCoxed"),
                seatCount: boat.get("seatCount"),
                seatAssignments: boat.get("seatAssignments")
            }));
        }

        return value;
    };

    return fromJS(serverData, reviver);
};

export const mapAttendees = serverData => {
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

export default serverData => ({
    eventSettings: mapEventSettings(serverData.eventSettings),
    boats: mapBoats(serverData.boats),
    attendees: mapAttendees(serverData.attendees)
});