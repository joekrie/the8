import Boat from "../Boat";
import { mount } from "enzyme";
import BoatRecord from "../../records/BoatRecord";
import AttendeeRecord from "../../records/AttendeeRecord";
import { List, Map } from "immutable";

describe("<Boat />", () => {
    it("mounts without error", () => {
        const boat = Map({
            boat: new BoatRecord({
                seatCount: 2,
                seatAssignments: Map([
                    [1, "rower-1"]
                ])
            }),
            attendees: List([
                new AttendeeRecord({ attendeeId: "rower-1" })
            ])
        });
        
        const props = {
            boat: boat.get("boat"),
            attendees: boat.get("attendees"),
            placeAttendees: jest.fn()
        };

        testUtils.expectToMountWithoutError(Boat, props);
    });
});