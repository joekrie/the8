import AssignableAttendeeList from "../AssignableAttendeeList";
import { mount } from "enzyme";
import AttendeeRecord from "../../records/AttendeeRecord";
import { List, Map } from "immutable";

describe("<AssignableAttendeeList />", () => {
    it("mounts without error", () => {
        const rowers = List([
            new AttendeeRecord({ attendeeId: "rower-1" })
        ]);

        const coxswains = List([
            new AttendeeRecord({ attendeeId: "cox-1", isCoxswain: true })
        ]);

        const props = {rowers,coxswains};
        testUtils.expectToMountWithoutError(AssignableAttendeeList, props);
    });
});