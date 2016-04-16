import AttendeeDragSource from "../AttendeeDragSource";
import { mount } from "enzyme";
import AttendeeRecord from "../../records/AttendeeRecord";
import { List, Map } from "immutable";

describe("<AttendeeDragSource />", () => {
    it("mounts without error", () => {
        const attendee = new AttendeeRecord({ attendeeId: "rower-1" });
        testUtils.expectToMountWithoutError(AttendeeDragSource, { attendee });
    });
});