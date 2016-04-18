import Boat from "../Boat";
import { mount } from "enzyme";
import BoatRecord from "../../records/BoatRecord";
import AttendeeRecord from "../../records/AttendeeRecord";
import { List, Map } from "immutable";

describe("<Boat />", () => {
    it("mounts without error", () => {
        const boat = new BoatRecord({
            seatCount: 2,
            seatAssignments: Map([
                [1, "rower-1"]
            ])
        });

        const attendees = List([
            new AttendeeRecord({ attendeeId: "rower-1" })
        ]);

        const placeAttendees = jest.fn();
        
        const props = {
            boat,
            attendees,
            placeAttendees
        };

        testUtils.expectToMountWithoutError(Boat, props);
    });
});