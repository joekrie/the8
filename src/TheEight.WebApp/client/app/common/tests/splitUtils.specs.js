jest.unmock("../splitUtils");

import { formatSplit, parseSplit } from "../splitUtils";

describe("boat lineup planner", () => {
    describe("AssignableAttendeeListContainer", () => {
        it("can add", () => {
            expect(2 + 2).toBe(4);
        });
    });
});