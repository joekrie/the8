import AssignableAttendeeListDropTarget from "../AssignableAttendeeListDropTarget";
import AttendeeRecord from "../../records/AttendeeRecord";
import { List } from "immutable";

describe("<AssignableAttendeeListDropTarget />", () => {
    it("mounts without error", () => {
        const rowers = List([
            new AttendeeRecord({ attendeeId: "rower-1" })
        ]);

        const coxswains = List([
            new AttendeeRecord({ attendeeId: "cox-1", isCoxswain: true })
        ]);

        testUtils.expectToMountWithoutError(AssignableAttendeeListDropTarget, { rowers, coxswains });
    });
});